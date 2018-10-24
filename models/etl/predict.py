"""Methods to select representative population points from the transformed EDDM data."""
import multiprocessing
import os

import geopandas as gpd

from models.etl import initiate
from models.representative_population_points import farthest_first_traversal

import numpy as np

from shapely import speedups

speedups.enable()


def select_points_using_model(
        input_gdf,
        model,
        distance_cutoffs=[],
        aggregation_methods={},
        column_mapping={}):
    """
    Select points using the model, attributing input data to the selected points.

    Return a GeoDataFrame of the selected points.

    Parameters
    ----------
    input_gdf: GeoDataFrame
        A GeoDataFrame to select points from.

    model:
        A means of selecting points. Has a `fit` method.

    distance_cutoffs: list
        A list of distance cutoffs to keep track of during model training.

    aggregation_methods: dict
        column_name --> aggregation_method mapping.
        Available aggregation methods: sum, min, max, min

    column_mapping: dict
        column_name --> new column_name
    """
    # FIXME: Implement cutoffs in a separate step from model training. Return
    # the model insted of the selected points during the predict step.
    try:
        weights = input_gdf['population'].values
    except KeyError:
        weights = None

    selected_points = model.fit(input_gdf['geometry'].values, weights)

    cutoff_indexes = []
    for cutoff in distance_cutoffs:
        index = next(
            (idx for idx, d in enumerate(model._max_distances_as_function_of_k)
                if d < cutoff),
            -1
        )
        cutoff_indexes.append(index)

    if not distance_cutoffs:
        distance_cutoffs = [0.0]
        cutoff_indexes = [-1]

    out_gdf = gpd.GeoDataFrame(selected_points, columns=['geometry'])

    for index, distance in zip(cutoff_indexes, distance_cutoffs):
        input_gdf['label'] = model._labels_as_function_of_k[index]
        g = input_gdf.groupby('label')

        for column, method in aggregation_methods.items():
            new_column = '{}_{}'.format(column, distance)
            out_gdf[new_column] = g[column].aggregate(method)

        input_gdf.drop('label', axis=1, inplace=True)

    for column in aggregation_methods:
        out_gdf[column] = np.empty((len(out_gdf), 0)).tolist()
        for distance in distance_cutoffs:
            new_column = '{}_{}'.format(column, distance)
            # Wrap values as lists.
            out_gdf[new_column] = out_gdf[new_column].apply(
                lambda row: [row] if not np.isnan(row) else [])
            # Combine lists and drop unneeded columns.
            out_gdf[column] = out_gdf[column] + out_gdf[new_column]
            out_gdf.drop(new_column, axis=1, inplace=True)

    out_gdf.rename(columns=column_mapping, inplace=True)

    return out_gdf


def predict(input_filename):
    """Select representative population points using the provided model."""
    try:
        print('Predicting {}...'.format(input_filename))

        points = initiate.load_points(
            filename=input_filename,
            directory=initiate.TRANSFORM_DIRECTORY,
            output_type='geopandas'
        )

        distance_cutoffs = [5.0, 2.5, 0.5]  # Measured in miles

        model = farthest_first_traversal.FarthestFirstTraversal(
            k=10**4, distance_cutoff=distance_cutoffs[-1]
        )
        selected_points = select_points_using_model(
            input_gdf=points,
            model=model,
            distance_cutoffs=distance_cutoffs,
            aggregation_methods={'population': sum},
            column_mapping={},
        )

        initiate.store_points(
            data=selected_points,
            filename=input_filename,
            directory=initiate.PREDICT_DIRECTORY,
        )

        scores = [input_filename]
        scores += model._max_distances_as_function_of_k
        initiate.store_points(
            data=scores,
            filename=input_filename,
            directory=initiate.SCORES_DIRECTORY,
        )

        status = 'SUCCESS'
        message = ''
        print('{} completed successfully!'.format(input_filename))

    except Exception as ex:
        status = 'FAILURE'
        message = type(ex).__name__ + ' ' + str(ex)
        print('Something went wrong with {}!'.format(input_filename))
        print(ex)

    return initiate.ETLResult(
        name=input_filename,
        status=status,
        message=message,
    )


def predict_concurrently(zip_county_pairs, num_processors=8):
    """Select representative population points concurrently."""
    pool = multiprocessing.Pool(num_processors)
    results = pool.map(predict, zip_county_pairs)

    initiate.store_artifacts(results, 'predict_results.csv', verbose=False)


def _get_remaining_service_areas():
    """Return service areas that still require predictions."""
    transformed_zips = [f for f in os.listdir(initiate.TRANSFORM_DIRECTORY) if '.json' in f]
    predicted_zips = {f for f in os.listdir(initiate.PREDICT_DIRECTORY) if '.json' in f}

    return [
        filename for filename in transformed_zips if filename not in predicted_zips
    ]


if __name__ == '__main__':
    zip_county_pairs = _get_remaining_service_areas()
    predict_concurrently(zip_county_pairs)
