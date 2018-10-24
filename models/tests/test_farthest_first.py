"""Tests for the farthest-first algorithm and implementation."""
from models.representative_population_points import farthest_first_traversal
from models.tests.assets import helpers

import pytest


class TestFarthestFirstTraversal():
    """Test the farthest-first traversal implementation."""

    def setup(self):
        """Initialize and fit algorithm."""
        self.points = helpers.load_sample_data()['geometry'].values
        self.k = 40
        self.traversal = farthest_first_traversal.FarthestFirstTraversal(k=self.k)
        self.traversal.fit(self.points)

    def test_that_unfitted_traversal_raises_attribute_error(self):
        """Test that the farthest first algorithm raises an error if not fitted."""
        unfitted_traversal = farthest_first_traversal.FarthestFirstTraversal(k=self.k)
        with pytest.raises(AttributeError):
            unfitted_traversal.selected_points

    def test_random_initial_point_selection_and_distance_cutoffs(self):
        """Test that the algorithm can be run using distance cutoffs and random initial point."""
        self.traversal = farthest_first_traversal.FarthestFirstTraversal(
            k=self.k,
            method_to_select_first_point='random',
            distance_cutoff=10**-4
        )
        self.traversal.fit(self.points)
