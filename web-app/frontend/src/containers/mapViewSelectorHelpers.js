import bbox from 'geojson-bbox'

export function getAllPointsCollection(areas=[], cutoffIndex) {
  const allPoints = areas.reduce((accu, area) => {
    return accu.concat(area.points.filter(
      point => point.properties.population.length > 3 - Math.round(cutoffIndex))
    )
  }, [])
  return {
    type: 'FeatureCollection',
    features: allPoints
  }
}

export function getBoundingBoxCoordinates(featureCollection) {
  let boundingBoxCoordinates = null
  if (featureCollection.features.length) {
    const boundingBox = bbox(featureCollection)
    boundingBoxCoordinates = [
      [boundingBox[0], boundingBox[1]],
      [boundingBox[2], boundingBox[3]],
    ]
  }
  return boundingBoxCoordinates
}

export function getGroupedPoints(areas=[], nGroups, cutoffIndex) {
  return areas.reduce((accu, area, i) => {
    const groupIndex = i % nGroups
    const group = accu[groupIndex] || []
    accu[groupIndex] = group.concat(area.points.filter(
      point => point.properties.population.length > 3 - Math.round(cutoffIndex))
    )
    return accu
  }, {})
}
