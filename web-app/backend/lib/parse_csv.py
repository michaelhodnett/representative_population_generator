"""Parse CSV."""
import csv
import io

from backend.lib.timer import timed


@timed
def parse_csv_to_json(zipcounty_file, logger=None):
    """Transform a csv into json."""
    logger.debug('Parsing CSV - {}.'.format(zipcounty_file))
    json_zipcounty_output = jsonify_input(zipcounty_file.read().decode('utf-8'))
    return json_zipcounty_output


def jsonify_input(input_string):
    """Convert input CSV file into a JSON object."""
    file_content = io.StringIO(input_string)
    return list(csv.DictReader(file_content))
