"""This file contains common methods and functions used throughout the test suite."""
import os

import geopandas as gpd


def load_sample_data():
    """Load the sample data into a GeoPandas GeoDataFrame."""
    return gpd.read_file(os.path.join(os.path.dirname(__file__), 'sample_data.geojson'))


def almost_equals(x, y, threshold=10**(-5)):
    """Return True when two numerical values are equal up to the threshold."""
    return abs(x - y) < threshold
