"""Methods for selecting a single point."""
from functools import partial

from models.representative_population_points import distance_metrics

import numpy as np

import shapely


def weighted_medoid(points, weights=None, metric=distance_metrics.get_metric('great_circle')):
    """
    Given a list of points, return the point that is closest to the weighted centroid.

    By default, all weights are set to 1.0.
    """
    # FIXME: Change centroid to treat Earth as a sphere.
    if weights is None:
        weights = np.ones(len(points))

    lons = [point.x for point in points]
    lats = [point.y for point in points]

    centroid = shapely.geometry.Point(
        (np.average(lons, weights=weights), np.average(lats, weights=weights))
    )
    distances = list(map(partial(metric, centroid), points))
    return points[np.argmin(distances)]


def random(points, weights=None, metric=None):
    """Choose a point at random using the provided weights."""
    if weights is None:
        weights = np.ones(len(points))

    return np.random.choice(points, p=weights / np.sum(weights))


def get_selection_method(name):
    """Return the selection method with the given name."""
    return selection_method_name_to_function_mapping[name.lower()]


selection_method_name_to_function_mapping = {
    'random': random,
    'weighted_medoid': weighted_medoid
}
