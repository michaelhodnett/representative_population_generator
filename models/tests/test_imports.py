"""Test that all modules can be imported successfully."""
import models


def test_all_imports():
    """TODO: Import all project files in this function."""
    dir(models)
    assert 1 == 1
