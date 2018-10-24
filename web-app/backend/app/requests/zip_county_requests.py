"""Requests handling for zip_counties."""
import json

from backend.lib.exceptions import InvalidFormat, InvalidPayload
from backend.lib.parse_csv import parse_csv_to_json
from backend.lib.standardize_input import standardize_request
from backend.lib.timer import timed

import flask


def _handle_csv_request(app, flask_request):
    zipcounties_file = flask_request.files['zipcounty_file']
    try:
        data = parse_csv_to_json(zipcounties_file, logger=app.logger)
    except KeyError:
        raise InvalidFormat(message='Invalid file format, please upload a CSV.')
    try:
        standardized_data = standardize_request(data)
        if standardized_data:
            return standardized_data
    except AttributeError:
        pass
    raise InvalidPayload(message='Invalid CSV file. No Zip or County columns found.')


def _handle_json_request(app, flask_request):
    if 'zipcounties' in flask_request.values:
        raw_data = flask_request.values['zipcounties']
    elif 'zipcounties' in flask_request.args:
        raw_data = flask_request.args['zipcounties']
    else:
        raw_data = flask_request.data
    try:
        data = json.loads(raw_data)
    except json.JSONDecodeError:
        raise InvalidFormat(message='Invalid JSON format.')
    standardized_data = standardize_request(data)
    if standardized_data:
        return standardized_data
    raise InvalidPayload(message='Invalid JSON file. No Zip or County found.')


@timed
def handle_zip_counties_request(app):
    """
    Understand request and redirect to the correct handler.

    Returns raw_zipcounties, which need to be standaradized.
    """
    with app.app_context():
        if 'zipcounty_file' in flask.request.files:
            return _handle_csv_request(app, flask.request)

        return _handle_json_request(app, flask.request)
