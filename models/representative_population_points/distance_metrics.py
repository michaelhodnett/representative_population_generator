"""
Methods for measuring the distance between two Shapely Point objects.

All metrics assume that the points are given as (longitude, latitude) pairs.
"""
import geopy.distance


def great_circle(p1, p2):
    """
    Calculate the great circle distance (in miles).

    Treats the Earth as a sphere using the average radius.
    """
    # Note: GeoPy expects (latitude, longitude) pairs.
    return geopy.distance.great_circle(
        (p1.y, p1.x),
        (p2.y, p2.x)
    ).miles


def vincenty(p1, p2):
    """
    Calculate the Vicenty distance (in miles).

    Treats the Earth as an ellipsoid.
    """
    # Note: GeoPy expects (latitude, longitude) pairs.
    return geopy.distance.vincenty(
        (p1.y, p1.x),
        (p2.y, p2.x)
    ).miles


def euclidean(p1, p2):
    """
    Calculate the Euclidean distance between two points (unitless).

    For points in the format (longitude, latitude), this is rarely the correct choice.
    """
    return p1.distance(p2)


def get_metric(name):
    """Return the metric with the given name."""
    return metric_name_to_function_mapping[name.lower()]


metric_name_to_function_mapping = {
    'great_circle': great_circle,
    'vincenty': vincenty,
    'euclidean': euclidean,
}
