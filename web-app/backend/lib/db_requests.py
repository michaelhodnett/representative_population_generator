"""Database requests."""
import json

from backend.lib.timer import timed


@timed
def fetch_representative_points(
        representative_points_coll, service_areas, boundary_coll, logger=None):
    """
    Given a list of service areas, fetch and return point As for each one.

    TODO make sure areas which were not found are marked as unavailable in response.
    """
    logger.debug('Finding representative points for {} service areas'.format(len(service_areas)))
    # Ignoring boundaries for now since they are unused in the client.
    # boundaries = find_boundaries_batch(boundary_coll, service_areas, logger)

    # Keep track of which service areas could be found.
    missing_service_areas = set(
        (area.get('countyName', None), area.get('zipCode', None))
        for area in service_areas
        if area.get('countyName', None) or area.get('zipCode', None)
    )

    representative_points = find_representative_points_batch(
        representative_points_coll,
        service_areas,
        logger
    )

    outputs = []

    # Prepare results for found service areas.
    for points_document in representative_points:
        county = points_document['ServiceArea']['CountyName']
        zip_ = points_document['ServiceArea']['ZipCode']
        point_as = points_document['ReprPopPoints']['PointA']
        area = {
            'countyName': county,
            'zipCode': zip_
        }

        outputs.append(
            prepare_return_object(
                points=point_as,
                boundary=None,
                area=area
            )
        )

        # Remove the current area from the set of unfound service areas.
        for element in [(county, zip_), (county, None), (None, zip_)]:
            missing_service_areas.discard(element)

    logger.debug('Found {} sets of representative points'.format(len(outputs)))

    # Prepare results for missing service areas.
    if missing_service_areas:
        logger.debug('No points found for {} service areas.'.format(len(missing_service_areas)))

        for area_tuple in missing_service_areas:
            area = {
                'countyName': area_tuple[0],
                'zipCode': area_tuple[1]
            }
            area = {k: v for k, v in area.items() if v}

            outputs.append(prepare_return_object(points=[], boundary=None, area=area))

    return outputs

@timed
def find_representative_points(representative_points_coll, service_area, logger=None):
    """Given a standard service_area, return corresponding representative points from db."""
    key_map = {'countyName': 'ServiceArea.CountyName', 'zipCode': 'ServiceArea.ZipCode'}
    try:
        area = dict((key_map[k], v) for k, v in service_area.items())
        representative_point = representative_points_coll.find_one(area)
        return representative_point['ReprPopPoints']['PointA']
    except:
        return []


@timed
def find_representative_points_batch(
        representative_points_coll, zip_county_pairs, logger=None):
    """Fetch all the matching points documents in a single query."""
    try:
        # Build a base query.
        query = {
            '$or': []
        }

        # Add each specified service area to the query condition.
        for zip_county_pair in zip_county_pairs:
            county = zip_county_pair.get('countyName', None)
            zip_ = zip_county_pair.get('zipCode', None)

            filter_element = {}

            # Filter using whatever combination of ZIP and county are provided.
            if county:
                filter_element['ServiceArea.CountyName'] = county
            if zip_:
                filter_element['ServiceArea.ZipCode'] = zip_
            if county or zip_:
                query['$or'].append(filter_element)

        logger.debug(json.dumps(query, sort_keys=True, indent=4))
        representative_points = representative_points_coll.find(query)
        return list(representative_points)
    except Exception as e:
        logger.error('Error retrieving representative points: {}'.format(e))
        return []


def find_boundaries_batch(boundary_coll, zip_county_pairs, logger=None):
    """Fetch all the matching boundary documents in a single query."""
    try:
        # Build a base query.
        query = {
            '$or': []
        }

        # Add each specified service area to the query condition.
        for zip_county_pair in zip_county_pairs:
            county = zip_county_pair.get('countyName', None)
            zip_ = zip_county_pair.get('zipCode', None)

            filter_element = {}
            # Filter using whatever combination of ZIP and county are provided.
            if county:
                filter_element['properties.NAME'] = county
            if zip_:
                filter_element['properties.ZIP'] = zip_
            if county or zip_:
                query['$or'].append(filter_element)

        logger.debug(json.dumps(query, sort_keys=True, indent=4))
        boundaries = boundary_coll.find(query)
        return list(boundaries)
    except Exception as e:
        logger.error('Error retrieving boundaries: {}'.format(e))
        return []


def find_boundary(boundary_coll, service_area, logger=None):
    """Given a standard service_area, find and return boundaries."""
    key_map = {'countyName': 'properties.NAME', 'zipCode': 'properties.ZIP'}
    try:
        area = dict((key_map[k], v) for k, v in service_area.items())
        boundary = boundary_coll.find_one(area)
        return {'geometry': boundary['geometry']}
    except:
        return None


def prepare_return_object(points, boundary, area):
    """Prepare the object that is being returned for each service_area."""
    return {
        'areaInfo': area,
        'points': points,
        'boundary': boundary,
        'availabilityStatus': _flag_service_area_availability(bool(points))
    }


def _flag_service_area_availability(is_available=True):
    return {
        'isServiceAreaAvailable': is_available,
        'message': 'Service area available.' if is_available else 'Service area unavailable.'
    }
