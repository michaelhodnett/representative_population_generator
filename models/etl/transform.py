"""Methods to clean and transform the raw data from the USPS EDDM tool."""
import multiprocessing
import os

import geojson

import geopandas as gpd

from models.etl import initiate

import pandas as pd

import shapely
from shapely import speedups

speedups.enable()


pd.options.mode.chained_assignment = None


def convert_json_data_to_geodataframe(json_data, spatial_reference='4326'):
    """Convert raw JSON objects from EDDM to a GeoDataFrame."""
    features = []

    for feature in json_data:
        new_feature = {}

        # Assume the feature is a LineString object.
        try:
            new_feature['geometry'] = shapely.geometry.shape(
                geojson.MultiLineString(feature['geometry']['paths'])
            )
        # If the feature is not a LineString, maybe it is a MultiPoint.
        except KeyError:
            new_feature['geometry'] = shapely.geometry.shape(
                geojson.MultiPoint(feature['geometry']['points'])
            )
        new_feature['properties'] = feature['attributes']
        features.append(new_feature)

    return gpd.GeoDataFrame.from_features(features, crs=spatial_reference)


def transpose_geodataframe(gdf, use_centroids=False):
    """
    Simplify GeoDataFrames with complex geometry.

    The ouput DataFrame will have one row for each point in the input geometry.
    If use_centroids is True, the centroid of each input geometry will be included as
    a separate record in the ouput.
    """
    wide_df = pd.DataFrame(
        gdf['geometry'].apply(
            lambda geo: [
                shapely.geometry.Point(point)
                for shape in list(geo.geoms)
                for point in (
                    list(shape.coords) + use_centroids * list(shape.centroid.coords)
                )
            ]
        ).tolist()
    )

    tmp_df = pd.concat([gdf, wide_df], axis=1).drop('geometry', axis=1)
    ndf = pd.melt(
        tmp_df,
        var_name='point_num',
        value_name='geometry',
        value_vars=list(wide_df.columns),
        id_vars=[col for col in gdf.columns if col != 'geometry']
    )

    # Remove spurious points with null geometry.
    points = gpd.GeoDataFrame(ndf[~pd.isnull(ndf['geometry'])])

    # Clean up duplicates.
    points['point_num'] = points['point_num'].astype(int)
    points['long'] = points['geometry'].apply(lambda p: p.coords.xy[0][0]).astype(float)
    points['lat'] = points['geometry'].apply(lambda p: p.coords.xy[1][0]).astype(float)
    points = points.drop_duplicates(['long', 'lat'])

    return points


def finalize_columns(points):
    """Finalize column names and contents."""
    # Calculate how many people each point represents.
    count_by_zip_crid = points.groupby('ZIP_CRID').count()['TOT_CNT']
    points['max_points_by_zip_crid'] = points['ZIP_CRID'].apply(
        lambda x: count_by_zip_crid.loc[x]
    )

    # Infer value when household size is null or missing.
    # This happens when a ZIP has only PO boxes.
    if 'AVG_HH_SIZ' not in points.columns:
        points['AVG_HH_SIZ'] = 1.0

    points['AVG_HH_SIZ'].fillna(1.0, inplace=True)

    points['population'] = (
        (points['AVG_HH_SIZ'] * points['TOT_CNT']) / points['max_points_by_zip_crid']
    )

    # Limit columns to meaningful ones.
    points = points[
        ['CITY_STATE', 'ZIP_CODE', 'ZIP_CRID', 'geometry', 'long', 'lat', 'population']
    ]
    column_mapping = {col: col.lower() for col in points.keys()}

    points.rename(columns=column_mapping, inplace=True)

    # TODO: Handle the case where no county match is found.
    points = assign_counties(points)
    return points


def assign_county(point, counties):
    """Assign a single point to its county."""
    try:
        match = next(
            county['NAME'] for _, county in counties.iterrows()
            if point.intersects(county['geometry'])
        )
    except StopIteration:
        match = None

    return match


def assign_counties(points):
    """Assign each point of a GeoDataFrame to a county."""
    counties = gpd.read_file(initiate.COUNTIES_FILEPATH)
    points['county'] = points['geometry'].apply(lambda p: assign_county(p, counties))

    null_mask = points['county'].isnull()
    if null_mask.sum() != 0:
        print('{} points (of {}) could not be assigned a county!'.format(
            null_mask.sum(), len(points)))
    return points[~null_mask]


def split_dataframe_by_column_value(df, column):
    """
    Split DataFrame according to the unique values in the specified column.

    Returns a list of DataFrames.
    """
    values = df[column].unique()
    return {value: df[df[column] == value] for value in values}


def _clean(json_data):
    raw_gdf = convert_json_data_to_geodataframe(json_data)

    if raw_gdf.empty:
        pass

    clean_df = transpose_geodataframe(raw_gdf)
    df = finalize_columns(clean_df)

    return df


def transform(input_filename):
    """Transform data into a usable format, split by county, then store."""
    try:
        print('Transforming {}...'.format(input_filename))
        json_data = initiate.load_points(
            filename=input_filename,
            directory=initiate.EXTRACT_DIRECTORY,
            output_type='json'
        )
        cleaned_df = _clean(json_data)

        points_by_county = split_dataframe_by_column_value(
            df=cleaned_df,
            column='county'
        )

        for county, points in points_by_county.items():
            initiate.store_points(
                data=points,
                filename=input_filename[:5] + '_' + county.lower().replace(' ', '_') + '.json',
                directory=initiate.TRANSFORM_DIRECTORY,
            )

        print('{} completed successfully!'.format(input_filename))

        status = 'SUCCESS'
        message = ''

    except Exception as ex:
        print('Something went wrong with {}!'.format(input_filename))
        status = 'FAILURE'
        message = type(ex).__name__ + ' ' + str(ex)

    return initiate.ETLResult(
        name=input_filename,
        status=status,
        message=message,
    )


def transform_concurrently(zips, num_processors=8):
    """Transform data for the provided ZIP codes."""
    pool = multiprocessing.Pool(num_processors)
    results = pool.map(transform, zips)

    initiate.store_artifacts(results, 'transform_results.csv', verbose=False)


def _get_remaining_zips():
    """Return ZIPs that still require transformation."""
    extracted_zips = [f for f in os.listdir(initiate.EXTRACT_DIRECTORY) if '.json' in f]
    transformed_zips = {f[:5] for f in os.listdir(initiate.TRANSFORM_DIRECTORY) if '.json' in f}

    return [
        filename for filename in extracted_zips if filename[:5] not in transformed_zips
    ]


if __name__ == '__main__':
    transform_concurrently(_get_remaining_zips())
