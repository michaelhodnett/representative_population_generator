"""Methods to merge the results of the ETL process into a single file."""
import collections
import os

import geojson

import geopandas as gpd

from models.etl import initiate

from shapely import speedups

speedups.enable()


def merge_predictions():
    """Merge results of the ETL into a single GeoJSON feature collection."""
    filepaths = [
        os.path.join(initiate.PREDICT_DIRECTORY, f)
        for f in os.listdir(initiate.PREDICT_DIRECTORY) if '.json' in f
    ]

    counties = gpd.read_file(initiate.COUNTIES_FILEPATH)
    census_data = gpd.read_file(initiate.CENSUS_FILEPATH).to_crs({'init': 'epsg:4326'})

    output = []

    for idx, filepath in enumerate(filepaths):

        zip_code = filepath[22:27]
        county_name = filepath[28:-5]
        match = counties[counties['NAME'].apply(
            lambda name: name.lower().replace(' ', '_')
        ) == county_name]

        county_fips = match['GEOID'].iloc[0]
        proper_county_name = match['NAME'].iloc[0]

        # TODO: Do census lookup during the predict step.
        census_subset = census_data[census_data['COUNTYFP'] == county_fips[-3:]]

        new_json = {}

        selected_points = initiate.load_points(filepath, '', 'geopandas')
        selected_points['county'] = proper_county_name
        selected_points['zip'] = zip_code
        selected_points = assign_census_features(selected_points, census_subset)
        selected_points['population'] = selected_points['population'].apply(
            lambda population_list: [round(x) for x in population_list]
        )

        new_features = geojson.loads(selected_points.to_json())['features']

        new_json['ServiceArea'] = {
            'CountyName': proper_county_name,
            'CountyFIPS': str(county_fips),
            'ZipCode': zip_code
        }

        new_json['ReprPopPoints'] = {
            'ModelVersion': 1.0,
            'ModelDesc': 'FFT with random initialization',
            'PointA': new_features
        }

        output.append(new_json)

        if idx % 10 == 0:
            print('{}: {}'.format(idx, filepath[22:]))

    return output


def assign_census_features(selected_points, census_gdf):
    """Assign a single point to regions defined by the census."""
    all_possible_census_features = ['TRACTCE', 'BLKGRPCE']
    available_census_features = [
        col for col in all_possible_census_features if col in census_gdf.columns
    ]

    merged_gdf = gpd.sjoin(
        selected_points,
        census_gdf[['geometry'] + available_census_features],
        how='left',
        op='intersects'
    ).drop('index_right', axis=1)

    census_feature_mapping = {
        'TRACTCE': 'census_tract',
        'TODO': 'census_block',
        'BLKGRPCE': 'census_block_group'
    }

    return merged_gdf.rename(
        columns={
            old_name: new_name
            for old_name, new_name in census_feature_mapping.items()
            if old_name in available_census_features
        }
    )


def get_service_areas(json_data):
    """Export service areas from JSON."""
    county_to_zip_mapping = collections.defaultdict(list)

    for zip_county_data in json_data:
        county_name = zip_county_data['ServiceArea']['CountyName']
        county_to_zip_mapping[county_name].append(zip_county_data['ServiceArea']['ZipCode'])

    results = {}
    for county, zip_list in county_to_zip_mapping.items():
        results[county] = {}
        results[county]['zips'] = zip_list

    return [results]


def filter_data_by_county(json_data, valid_counties):
    """Return only JSON data for the specified counties."""
    return [
        area for area in all_data if area['ServiceArea']['CountyName'] in valid_counties
    ]


if __name__ == '__main__':
    all_data = merge_predictions()
    all_service_areas = get_service_areas(all_data)

    sample_data = filter_data_by_county(
        all_data, valid_counties={'San Francisco', 'Marin', 'San Diego', 'Alameda'}
    )
    sample_service_areas = get_service_areas(sample_data)

    initiate.store_points(all_data, 'eddm_data.json', 'data/')
    initiate.store_points(sample_data, 'sample_eddm_data.json', 'data/')

    initiate.store_points(all_service_areas, 'service_areas.json', 'data/')
    initiate.store_points(sample_service_areas, 'sample_service_areas.json', 'data/')
