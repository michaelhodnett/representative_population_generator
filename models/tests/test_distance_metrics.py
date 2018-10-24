"""Tests for the distance_metrics module."""
from models.representative_population_points import distance_metrics
from models.tests.assets import helpers

import pytest

import shapely.geometry


class TestMetrics():
    """Test all metrics in the distance_metrics module."""

    def setup(self):
        """Initialize test points."""
        self.newport_ri = shapely.geometry.Point(-71.312796, 41.49008)
        self.cleveland_oh = shapely.geometry.Point(-81.695391, 41.499498)

    def test_great_circle_distance(self):
        """Check that the great circle distance matches expectations."""
        assert (
            helpers.almost_equals(
                distance_metrics.great_circle(self.newport_ri, self.cleveland_oh),
                537.1485284062817
            )
        )

    def test_vincenty_distance(self):
        """Check that the Vincenty distance matches expectations."""
        assert (
            helpers.almost_equals(
                distance_metrics.vincenty(self.newport_ri, self.cleveland_oh),
                538.3904451566326
            )
        )

    def test_euclidean_distance(self):
        """Check that the Euclidean distance matches expectation."""
        assert (
            helpers.almost_equals(
                distance_metrics.euclidean(self.newport_ri, self.cleveland_oh),
                10.382599271509466
            )
        )


def test_get_metric():
    """Check that get_metric returns a callable function in all cases."""
    for name in ('great_circle', 'vincenty', 'euclidean'):
        assert(callable(distance_metrics.get_metric(name)))


def test_get_metric_raises_error_when_supplied_invalid_key():
    """get_metric should raise an AttributeError when the metric does not exist."""
    with pytest.raises(KeyError):
        distance_metrics.get_metric('not_a_valid_distance_metric')
