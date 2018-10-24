
import {countyZipsToObjects, getUnavailableServiceAreas} from './actions'

it('should correctly transform countyZip strings into objects for the request', () => {
  const countyZips = ['demoCounty-12345']
  const res = countyZipsToObjects(countyZips)
  expect(res.length).toBe(1)
  expect(res[0].county).toBe('demoCounty')
  expect(res[0].zip).toBe('12345')
});

it('should return a list of unavailable service areas', () => {
  const areas = [
    {availabilityStatus: {isServiceAreaAvailable: true}},
    {availabilityStatus: {isServiceAreaAvailable: false}},
    {availabilityStatus: {isServiceAreaAvailable: false}},
  ]
  const res = getUnavailableServiceAreas(areas)
  expect(res.length).toBe(2)
});
