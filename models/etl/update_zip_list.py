"""Methods to create a master list of California ZIP codes."""
import os

from models.etl import initiate

import pandas as pd


def update_zip_list(input_filepath, output_filepath):
    """From county-level census data, generate polygons for California counties."""
    df = pd.read_csv(input_filepath, dtype={'zip': str}, encoding='latin')
    california_only = df[df['state'] == 'CA']

    try:
        os.remove(output_filepath)
    except FileNotFoundError:
        pass

    california_only.to_csv(output_filepath, sep='\t')
    return california_only


if __name__ == '__main__':
    input_filepath = os.path.join(initiate.RAW_DIRECTORY, 'zips.csv')

    update_zip_list(
        input_filepath=input_filepath,
        output_filepath='data/california_zips.tsv'
    )
