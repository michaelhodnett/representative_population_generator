"""Python script to kick off the ETL process."""
import subprocess
import sys


def start_etl(teardown=False):
    """Start the ETL process."""
    steps = [
        ('Initiate', 'python models/etl/initiate.py'),
        ('Fetch raw ETL data', 'make fetch_raw_etl_data'),
        ('Update ZIP list', 'python models/etl/update_zip_list.py'),
        ('Update county polygons', 'python models/etl/update_counties.py'),
        ('Extract', 'python models/etl/extract.py'),
        ('Transform', 'python models/etl/transform.py'),
        ('Predict', 'python models/etl/predict.py'),
        ('Merge', 'python models/etl/merge.py'),
    ]

    if teardown:
        steps = [('Teardown', 'python models/etl/teardown.py')] + steps

    exit_code = 0
    for step in steps:
        subprocess.call(args=['echo "{}"'.format(step[0])], shell=True)
        exit_code = subprocess.call(args=[step[1]], shell=True)
        if exit_code != 0:
            break


if __name__ == '__main__':
    if '--teardown' in sys.argv[1:]:
        start_etl(teardown=True)
    else:
        start_etl(teardown=False)
