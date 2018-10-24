
const apiHostname = process.env.REACT_APP_API_HOSTNAME

export function getCounties() {
  return fetch(apiHostname + '/available-service-areas/')
    .then(response => response.json())
    .then(response => response.result[0])
}

export function getAreas(countyZips) {
  const body = JSON.stringify(countyZips)
  const length = body.length
  // IE11 supports GET requests of up to 2048 chars.
  // For longer requests, use POST.
  if (length < 2000) {
    return fetch(apiHostname + '/areas?zipcounties=' + body)
    .then(response => response.json())
    .then(response => response.result)
  } else {
    return fetch(apiHostname + '/areas', {
        method: 'POST',
        body: body
      })
    .then(response => response.json())
    .then(response => response.result)
  }
}

export function getAreasFromFile(file) {
  const data = new FormData()
  data.append('zipcounty_file', file)

  return fetch(apiHostname + '/areas', {
      method: 'POST',
      body: data
    })
  .then(response => {
    if (response.status === 200) {
      return response.json()
    } else {
      return response.json().then(response => {
        throw new Error(response.message)
      })
    }
  })
  .then(response => response.result)
}
