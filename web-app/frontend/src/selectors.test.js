import {getAllPointsCollection, getGroupedPoints} from './containers/mapViewSelectorHelpers'
import {getAllPoints} from './containers/tableViewSelectorHelpers'

const pointsArea1 = [
        {
          properties: {zip: '12345', county: 'bla', population: [1, 2, 3]},
          geometry: {coordinates: [1, 2]},
        },
        {
          properties: {zip: '12345', county: 'bla', population: [1, 2]},
          geometry: {coordinates: [1, 2]},
        },
        {
          properties: {zip: '12345', county: 'bla', population: [1]},
          geometry: {coordinates: [1, 2]},
        }
      ]

const pointsArea2 = [
        {
          properties: {zip: '123456', county: 'bla', population: [1, 2, 3]},
          geometry: {coordinates: [1, 2]},
        },
        {
          properties: {zip: '123456', county: 'bla', population: [1, 2]},
          geometry: {coordinates: [1, 2]},
        },
        {
          properties: {zip: '123456', county: 'bla', population: [1]},
          geometry: {coordinates: [1, 2]},
        }
      ]

it('should limit the number of points per area in the all points collection', () => {
  const areas = [
    {points: pointsArea1},
    {points: pointsArea2}
  ]
  const cutoffIndex = 2
  const res = getAllPointsCollection(areas, cutoffIndex)
  expect(res.features.length).toBe(4)
})

it('should group the points from a list of areas correctly', () => {
  const areas = [
    {points: pointsArea1},
    {points: pointsArea2}
  ]
  const nGroups = 2
  const cutoffIndex = 2
  const res = getGroupedPoints(areas, nGroups, cutoffIndex)
  expect(Object.keys(res).length).toBe(nGroups)
  expect(res[0].length).toBe(2)
  expect(res[1].length).toBe(2)
})

it('should limit the number of points per area in the list of all points', () => {
  const areas = [
    {points: pointsArea1},
    {points: pointsArea2}
  ]
  const cutoffIndex = 1
  const res = getAllPoints(areas, cutoffIndex)
  expect(res.length).toBe(2)

})
