"""Standardize input."""
from backend.lib.timer import timed
# TODO - Split the helper file into meaningful modules.


@timed
def standardize_request(input_json_list):
    """
    Given a list of json object, standardize it by removing empty items and change the keys.

    Return a list of dicts with keys being any combination of ('countyName', 'zipCode').
    """
    stage_1 = list(map(_standardize_keys, input_json_list))
    zipcounties = list(map(_remove_empty_items, filter(None, stage_1)))
    zipcounties = _remove_duplicates(zipcounties)
    # Standardize county names.
    zipcounties = [_standardize_county_name(zipcounty) for zipcounty in zipcounties]
    return zipcounties


def _standardize_keys(zipcounty):
    """Standardize and keep relevent fields (zip and county)."""
    standard_area = {}
    for k, v in zipcounty.items():
        if k.replace(' ', '').lower() in ['zip', 'zipcode', 'zip code']:
            standard_area['zipCode'] = v
        if k.replace(' ', '').lower() in ['county', 'countyname', 'county name']:
            standard_area['countyName'] = v
    return standard_area


def _remove_empty_items(input_json):
    """Removing nulls and empty strings from input_json."""
    row_output = dict((k, v) for k, v in input_json.items() if v)
    return row_output if row_output else None


def _remove_duplicates(zipcounties):
    return [
        dict(zipcounty_tuple) for zipcounty_tuple in
        set([tuple(zipcounty.items()) for zipcounty in zipcounties])
    ]


def _standardize_county_name(zipcounty):
    """
    Standardize county name to match with our 'San Francisco' like formatting.

    Takes a zipcounty dict and updates 'countyName' key if exists.
    """
    if 'countyName' in zipcounty.keys():
        countyname = zipcounty['countyName'].lower()
        county_list = [word[0].upper() + word[1:] for word in countyname.split()]
        zipcounty['countyName'] = ' '.join(county_list)

    return zipcounty
