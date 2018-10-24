"""Routing for backend API."""
from backend.app.requests.zip_county_requests import handle_zip_counties_request
from backend.lib.db_requests import fetch_representative_points
from backend.lib.exceptions import InvalidPayload
from backend.lib.standardize_input import standardize_request
from backend.lib.timer import timed

import flask

from flask_pymongo import PyMongo


app = flask.Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://mongo:27017/na-db'
app.config['MONGO_CONNECT'] = False

_FETCHED_AREAS = None

mongo = PyMongo(app)
with app.app_context():
    repr_points = mongo.db.representative_points
    service_areas = mongo.db.service_areas
    boundaries = mongo.db.boundaries


@timed
@app.route('/available-service-areas/', methods=['GET'])
def fetch_available_service_areas():
    """Fetch and return all available service areas from db."""
    global _FETCHED_AREAS

    if not _FETCHED_AREAS:
        app.logger.debug('Fetching available service areas.')
        _FETCHED_AREAS = list(service_areas.find({}, {'_id': 0}))
    else:
        app.logger.debug('Using pre-loaded available service areas.')
    fetched_areas = _FETCHED_AREAS

    app.logger.debug('Fetched available service areas.')

    return flask.jsonify({'result': fetched_areas})


@timed
@app.route('/areas', methods=['GET', 'POST'])
def get_multiple_zip_county_points():
    """
    Given a list of areas return the list of corresponding points.

    input: list of zip and county objects in either of three formats:
        - list of zip-county objects as body of POST request
        - list of zip-county objects as params of GET request
        - list of zip-county as a csv file in body of POST request
    E.g. areas = [
        {"county": "sanFrancisco", "zip": "94102"},
        {"county": "sanFrancisco"},
        {"zip": "94705"}
    ]
    returns: json object with info about area and a list of points.
    """
    app.logger.debug('Extracting zip counties.')
    raw_zipcounties = handle_zip_counties_request(app)
    zipcounties = standardize_request(raw_zipcounties)
    app.logger.debug('Received {} zipcounties.'.format(len(zipcounties)))
    outputs = fetch_representative_points(repr_points, zipcounties, boundaries, logger=app.logger)
    return flask.jsonify({'result': outputs})


@app.errorhandler(InvalidPayload)
def handle_invalid_payload(error):
    """Handle exception when the payload is invalid."""
    app.logger.warning('Invalid Payload passed to backend: {}.'.format(error))
    response = flask.jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=8080)
