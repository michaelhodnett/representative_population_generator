import * as api from './api'

export const START_REQUEST = 'START_REQUEST'
export const FINISH_REQUEST = 'FINISH_REQUEST'
export const SET_APP_VARIABLE = 'SET_APP_VARIABLE'
export const SET_COUNTY = 'SET_COUNTY'
export const REMOVE_COUNTY = 'REMOVE_COUNTY'
export const SET_COUNTY_ZIP = 'SET_COUNTY_ZIP'
export const REMOVE_COUNTY_ZIP = 'REMOVE_COUNTY_ZIP'
export const SET_SELECT_ALL_CHECKED = 'SET_SELECT_ALL_CHECKED'
export const SET_SELECT_ALL_UNCHECKED = 'SET_SELECT_ALL_UNCHECKED'

function setAppVariableAction(variable, value) {
  return {type: SET_APP_VARIABLE, value, variable}
}

function startRequestAction(resource) {
  return {type: START_REQUEST, resource}
}

function finishRequestAction(resource, result) {
  return {type: FINISH_REQUEST, resource, result}
}

export function selectCountyAction(county) {
  return {type: SET_COUNTY, county}
}

export function removeCountyAction(county) {
  return {type: REMOVE_COUNTY, county}
}

function selectCountyZipAction(countyZip) {
  return {type: SET_COUNTY_ZIP, countyZip}
}

function removeCountyZipAction(countyZip) {
  return {type: REMOVE_COUNTY_ZIP, countyZip}
}

export function setSelectAllCheckedAction() {
  return {type: SET_SELECT_ALL_CHECKED}
}

export function setSelectAllUncheckedAction() {
  return {type: SET_SELECT_ALL_UNCHECKED}
}

export const setSelectAllCheckedAndFetchAreas = () => (dispatch, getState) => {
  dispatch(setSelectAllCheckedAction())
  const {selectedCountyZips} = getState().app
  dispatch(fetchAreas(selectedCountyZips))
}

export const setSelectAllUnchecked = () => dispatch => {
  dispatch({type: SET_SELECT_ALL_UNCHECKED})
  dispatch(finishRequestAction('areas', []))
}

export const selectCountyZipAndFetchAreas = countyZip => (dispatch, getState) => {
  dispatch(selectCountyZipAction(countyZip))
  const {selectedCountyZips} = getState().app
  dispatch(fetchAreas(selectedCountyZips))
}

export const removeCountyZipAndFetchAreas = countyZip => (dispatch, getState) => {
  dispatch(removeCountyZipAction(countyZip))
  const {selectedCountyZips} = getState().app
  if (selectedCountyZips.length) {
    dispatch(fetchAreas(selectedCountyZips))
  } else {
    dispatch(finishRequestAction('areas', []))
  }
}

export const fetchCounties = () => dispatch => {
  dispatch(startRequestAction('counties'))
  api.getCounties().then(counties => {
    dispatch(finishRequestAction('counties', counties))
  })
  .catch(error => {
    dispatch(finishRequestAction('counties', []))
    dispatch(setAppVariableAction('snackMessage', 'Error - Available Areas - ' + error.message))
  })
}

export const fetchAreas = selectedCountyZips => dispatch => {
  dispatch(setAppVariableAction('selectedCSVFileName', ''))
  dispatch(startRequestAction('areas'))
  const countyZipObjects = countyZipsToObjects(selectedCountyZips)
  api.getAreas(countyZipObjects).then(areas => {
    dispatch(finishRequestAction('areas', areas))
  })
}

export const fetchAreasFromCSVFile = file => dispatch => {
  dispatch(setAppVariableAction('selectedCSVFileName', file.name))
  dispatch(startRequestAction('areas'))
  api.getAreasFromFile(file).then(areas => {
    dispatch(finishRequestAction('areas', areas))
    const missingAreas = getUnavailableServiceAreas(areas)
    dispatch(setAppVariableAction('missingAreas', missingAreas))
  })
  .catch(error => {
    dispatch(finishRequestAction('areas', []))
    dispatch(setAppVariableAction('snackMessage', error.message))
  })
}

export function setViewMode(viewMode) {
  return setAppVariableAction('viewMode', viewMode)
}

export function setCutoff
(cutoffIndex) {
  return setAppVariableAction('cutoffIndex', cutoffIndex)
}

export const resetAreaSelector = () => dispatch => {
  dispatch(setAppVariableAction('selectedCounties', []))
  dispatch(setAppVariableAction('selectedCountyZips', []))
  dispatch(setAppVariableAction('isSelectAllChecked', false))
  dispatch(setAppVariableAction('selectedCSVFileName', ''))
  dispatch(finishRequestAction('areas', []))
}

export function resetMissingAreas() {
  return setAppVariableAction('missingAreas', [])
}

export function resetSnackMessage() {
  return setAppVariableAction('snackMessage', '')
}


export function countyZipsToObjects(selectedCountyZips) {
  return selectedCountyZips.map(countyZip => {
    const [county, zip] = countyZip.split('-')
    return {county, zip}
  })
}

export function getUnavailableServiceAreas(areas) {
  return areas.reduce((accu, area) => {
    return area.availabilityStatus.isServiceAreaAvailable ?
      accu : accu.concat([area.areaInfo])
  }, [])
}
