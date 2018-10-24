export function getAllPoints(areas=[], cutoffIndex) {
  const points = [];
  areas.forEach(area => {
    area.points.filter(
      point => point.properties.population.length > 3 - Math.round(cutoffIndex)
      ).forEach(point => {
      points.push({
        zipCode: point.properties.zip,
        county: point.properties.county,
        population: point.properties.population,
        longitude: point.geometry.coordinates[0],
        latitude: point.geometry.coordinates[1],
        censusTract: Math.round(point.properties.census_tract),
        censusBlockGroup: Math.round(point.properties.census_block_group),
      })
    })
  })
  return points
}
