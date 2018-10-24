"""Helper for tests."""


def compare_lists_of_dict(list_1, list_2):
    """Compare two lists of dicts."""
    return (
        set([tuple(zipcounty.items()) for zipcounty in list_1]) ==
        set([tuple(zipcounty.items()) for zipcounty in list_2])
    )
