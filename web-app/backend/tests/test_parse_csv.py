"""All tests related to parsing CSV file."""

import io

from backend.lib.parse_csv import jsonify_input


def _load_convert_file(file_path):
    with io.open(file_path, 'r') as fname:
        converted_input_file = io.BytesIO(fname.read().encode('ascii'))
    return converted_input_file


def test_jsonify_input():
    """Test jasonify_input method."""
    object_to_send = _load_convert_file('tests/assets/test_input_zip_and_county.csv')
    output_json = jsonify_input(object_to_send.read().decode('utf-8'))
    expected_output = [
        {
            'CountyName': 'San Diego',
            'City': 'Vista',
            'ZipCode': '92084',
            'PopulationPointsPerZipCode': '100'
        },
        {
            'CountyName': 'san francisco',
            'City': 'san Francisco',
            'ZipCode': '94117',
            'PopulationPointsPerZipCode': '1001'
        }
    ]

    assert output_json == expected_output
