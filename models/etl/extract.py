"""This module scrapes data from the USPS EDDM website and stores it in a usable format."""
import multiprocessing.dummy
import os

from models.etl import initiate

import pandas as pd

import requests

from retrying import retry

from shapely import speedups

speedups.enable()

pd.options.mode.chained_assignment = None

BASE_URL = (
    'https://gis.usps.com/arcgis/rest/'
    'services/EDDM/selectZIP/GPServer/'
    'routes/execute?f=json&env%3AoutSR={spatial_reference}&ZIP={zip_code}'
    '&Rte_Box={route_or_box}&UserName=EDDM'
)


def request_item(zip_code, only_return_po_boxes=False, spatial_reference='4326'):
    """
    Request data for a single ZIP code, either routes or PO boxes.

    Note that the spatial reference '4326' returns latitudes and longitudes of results.
    """
    url = BASE_URL.format(
        zip_code=str(zip_code),
        spatial_reference=str(spatial_reference),
        route_or_box='B' if only_return_po_boxes else 'R'
    )
    response = requests.get(url)
    response.raise_for_status()

    return response.json()


@retry(stop_max_attempt_number=5, wait_fixed=2000)
def request_zip(zip_code, spatial_reference='4326'):
    """Request data for a single ZIP code."""
    print('...Requesting ZIP {}\n'.format(str(zip_code)))

    route_results = request_item(
        zip_code, spatial_reference=spatial_reference, only_return_po_boxes=False
    )

    po_boxes_results = request_item(
        zip_code, spatial_reference=spatial_reference, only_return_po_boxes=True
    )

    json_results = route_results['results'][0]['value']['features'] + (
        po_boxes_results['results'][0]['value']['features']
    )

    return json_results


def extract(zip_code):
    """
    Request data from USPS for a single ZIP.

    Return problematic ZIP codes.
    """
    filename = '{}.json'.format(str(zip_code))
    try:
        json_data = request_zip(str(zip_code))
        if not json_data:
            print('No points found for ZIP {} in EDDM!'.format(str(zip_code)))
            status = 'WARNING'
            message = 'No points found in EDDM!'
        else:
            print('ZIP {} completed succesfully!'.format(str(zip_code)))
            initiate.store_points(
                data=json_data,
                filename=filename,
                directory=initiate.EXTRACT_DIRECTORY
            )
            status = 'SUCCESS'
            message = ''
    except Exception as ex:
        print('Something went wrong when requesting ZIP code {}! \n'.format(str(zip_code)))
        status = 'FAILURE'
        message = type(ex).__name__ + ' ' + str(ex)

    return initiate.ETLResult(
        name=zip_code,
        status=status,
        message=message,
    )


def extract_concurrently(zips):
    """
    Extract EDDM data for all provided ZIPs concurrently.

    Ignores existing ZIPs in the EXTRACT_DIRECTORY.
    """
    processed_zips = {f[:5] for f in os.listdir(initiate.EXTRACT_DIRECTORY) if '.json' in f}
    remaining_zips = [code for code in zips if code not in processed_zips]

    pool = multiprocessing.dummy.Pool(255)
    results = pool.map(extract, remaining_zips)

    initiate.store_artifacts(results, 'extract_results.csv', verbose=False)


if __name__ == '__main__':
    zip_df = pd.read_csv(initiate.ZIP_LIST_FILEPATH, sep='\t')
    zips = [str(code) for code in zip_df['zip'].values if str(code)]
    extract_concurrently(zips)
