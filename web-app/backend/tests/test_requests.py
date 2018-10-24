"""Test request handler."""
# TODO - Revamp test file and add tests for _handle_json_request
import io

from backend.app.requests.zip_county_requests import _handle_csv_request
from backend.lib.exceptions import InvalidPayload
from backend.lib.standardize_input import standardize_request
from backend.tests.helper import compare_lists_of_dict

import flask

from flask_testing import LiveServerTestCase

import mock

import pytest


def _load_convert_file(file_path):
    with io.open(file_path, 'r') as fname:
        converted_input_file = io.BytesIO(fname.read().encode('ascii'))
    return converted_input_file


class TestGetZipCounties(LiveServerTestCase):
    """Test class for handle_zip_counties_request method."""

    def create_app(self):
        """Start a new flask app for testing."""
        app = flask.Flask(__name__)
        app.config['TESTING'] = True
        return app

    def _testing_csv_parsing(self, file_path):
        """Generic test method for parsing valid CSV file."""
        mock_file = _load_convert_file(file_path)
        mock_request = mock.MagicMock()
        mock_request.files = {'zipcounty_file': mock_file}
        output = _handle_csv_request(
            self.app,
            mock_request
        )
        output = standardize_request(output)

        return output

    def test_parsing_csv_zip_and_county(self):
        """Test parsing of test_input_zip_and_county.csv with both zip and county columns."""
        expected = [
            {
                'countyName': 'San Diego',
                'zipCode': '92084'
            },
            {
                'countyName': 'San Francisco',
                'zipCode': '94117'
            }
        ]
        output = self._testing_csv_parsing('tests/assets/test_input_zip_and_county.csv')
        assert compare_lists_of_dict(expected, output)

    def test_parsing_csv_county_only(self):
        """Test parsing of test_input_county_only.csv with only county column."""
        expected = [
            {
                'countyName': 'San Diego',
            },
            {
                'countyName': 'San Francisco',
            }
        ]
        output = self._testing_csv_parsing('tests/assets/test_input_county_only.csv')
        assert compare_lists_of_dict(expected, output)

    def test_parsing_csv_zip_only_self(self):
        """Test parsing of test_input_zip_only.csv with only zip column."""
        expected = [
            {
                'zipCode': '94117',
            },
            {
                'zipCode': '94103',
            },
            {
                'zipCode': '94102',
            },
            {
                'zipCode': '94110',
            },
            {
                'zipCode': '94114',
            },
            {
                'zipCode': '92154',
            },
            {
                'zipCode': '91935',
            },
            {
                'zipCode': '92055',
            },

        ]
        output = self._testing_csv_parsing('tests/assets/test_input_zip_only.csv')
        assert compare_lists_of_dict(expected, output)

    def test_parsing_csv_no_zip_no_county(self):
        """Test parsing of test_input_no_zip_no_county.csv with no zip nor county columns."""
        with pytest.raises(InvalidPayload):
            self._testing_csv_parsing('tests/assets/test_input_no_zip_no_county.csv')

    def test_parsing_csv_invalid_file(self):
        """Test parsing of test_invalid_input_file.csv with invalid input file."""
        with pytest.raises(InvalidPayload):
            self._testing_csv_parsing('tests/assets/test_invalid_input_file.csv')
