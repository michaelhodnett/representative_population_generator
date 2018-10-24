/*
The requirement from the [SOW](https://goo.gl/6tnw5D) was to use Mapbox.
There are two main React components that interface with Mapbox. The more
popular component is uber/react-map-gl, but I decided against using it as
it does not play nice with webpack and would force us to eject from the
create-react-app environment. Furthermore the examples look overly complex
for the simple problem we want to solve.
This is why I decided to use alex3165/react-mapbox-gl, the second most
popular component to interface from React to Mapbox. It seems well documented
and I have used it in the past.
*/

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import ReactMapboxGl, {Layer, Feature, Popup, ScaleControl, ZoomControl} from 'react-mapbox-gl'

import LoadingOverlay from '../components/LoadingOverlay'
import types from '../types'
import {getBoundingBoxCoordinates, getAllPointsCollection, getGroupedPoints} from './mapViewSelectorHelpers'

const CENTER_OF_CALIFORNIA = [-119.182111, 36.250471]
const INITIAL_ZOOM_LEVEL = [3]
const AREA_COLORS = [
  '#1F77B4',
  '#2EA02C',
  '#BCBD21',
  '#E377C2',
  '#8C564B',
  '#9467BD',
  '#FF7F0D',
  '#1ABECF',
  '#D62728',
]


// Mapbox Access Token & Map
const accessToken = process.env.REACT_APP_MAPBOX_TOKEN
const networkAdequacyMapStyle = 'mapbox://styles/bayesimpact/cj8qeq6cpajqc2ts1xfw8rf2q'
const Map = ReactMapboxGl({accessToken, attributionControl:true});


class MapView extends Component {

  static propTypes = {
    groupedPoints: PropTypes.objectOf(PropTypes.arrayOf(types.pointShape)),
    isLoading: PropTypes.bool.isRequired,
    style: PropTypes.object,
    boundingBoxCoordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  };

  state = {
    hoveredPoint: null,
  };

  handlePointHover = point => {
    this.setState({hoveredPoint: point})
  };

  handlePointLeave = () => {
    this.setState({hoveredPoint: null})
  };

  render() {
    const {groupedPoints, isLoading, style, boundingBoxCoordinates, cutoffIndex} = this.props
    const {hoveredPoint} = this.state
    const fullContainerStyle = {height: '100%', width: '100%'}
    return (
      <div style={{position: 'relative', ...style}}>
        {isLoading ? <LoadingOverlay /> : null}
        <Map
            // eslint-disable-next-line
            style={networkAdequacyMapStyle}
            center={CENTER_OF_CALIFORNIA}
            zoom={INITIAL_ZOOM_LEVEL}
            fitBounds={boundingBoxCoordinates}
            fitBoundsOptions={{padding: 30}}
            containerStyle={fullContainerStyle}>
          {Object.keys(groupedPoints).map(i => {
            // Points are grouped because the mapbox component has issues with many layers.
            // Performance becomes horrible when adding a layer for every area and we only
            // have a small number of colors anyways.
            return (
              <PointsLayer
                  key={i}
                  points={groupedPoints[i]}
                  color={AREA_COLORS[i]}
                  onPointHover={this.handlePointHover}
                  onPointLeave={this.handlePointLeave} />
            )
          })}
          <div className="popup-container">
            {hoveredPoint && <DetailsPopup point={hoveredPoint} cutoffIndex={cutoffIndex} />}
          </div>
          <ZoomControl position="bottomLeft" />
          <ScaleControl measurement="mi" position="bottomLeft" style={{ left: 48 }} />
          <div>
          </div>
        </Map>

      </div>
    )
  }
}


class PointsLayer extends Component {

  static propTypes = {
    points: PropTypes.arrayOf(types.pointShape).isRequired,
    color: PropTypes.string.isRequired,
    onPointHover: PropTypes.func.isRequired,
    onPointLeave: PropTypes.func.isRequired,
  };

  render() {
    const {points, color, onPointHover, onPointLeave} = this.props
    const pointStyle = {
      'circle-radius': {
        stops: [[8, 1], [11, 6], [16, 20]]
      },
      'circle-color': color,
      'circle-opacity': .7,
    }
    return (
      <Layer type="circle" paint={pointStyle}>
        {points.map((point, i) => (
          <Feature
              onMouseEnter={() => onPointHover(point)}
              onMouseLeave={() => onPointLeave()}
              key={i}
              coordinates={point.geometry.coordinates}/>
        ))}
      </Layer>
    )
  }
}


class DetailsPopup extends Component {

  static propTypes = {
    point: types.pointShape,
    cutoffIndex: PropTypes.number.isRequired,
  };

  render() {
    const {point, cutoffIndex} = this.props
    const pointProps = point.properties
    return (
      <Popup
          offset={[0, -20]}
          anchor="bottom"
          coordinates={point.geometry.coordinates} >
        <table style={{fontSize: 14, color: '#ddd'}}>
          <tbody>
            <TableRow name="County" value={pointProps.county} />
            <TableRow name="ZIP" value={pointProps.zip} />
            <TableRow name="No. Residents" value={
                pointProps.population[Math.min(cutoffIndex, pointProps.population.length)-1]} />
            <TableRow name="Lat" value={point.geometry.coordinates[1].toFixed(6)} />
            <TableRow name="Long" value={point.geometry.coordinates[0].toFixed(6)} />
            <TableRow name="Tract" value={pointProps.census_tract} />
            <TableRow name="Block Group" value={pointProps.census_block_group} />
          </tbody>
        </table>
      </Popup>
    )
  }
}


const TableRow = ({name, value}) => (
  <tr>
    <td>{name}</td>
    <td style={{paddingLeft: 15}}>{value}</td>
  </tr>
)
TableRow.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};


const mapStateToProps = ({data: {areas}, app: {cutoffIndex}, isLoading}) => {
  const allPointsCollection = getAllPointsCollection(areas, cutoffIndex)
  const groupedPoints = getGroupedPoints(areas, AREA_COLORS.length, cutoffIndex)
  return {
    isLoading: isLoading.counties || isLoading.areas,
    boundingBoxCoordinates: getBoundingBoxCoordinates(allPointsCollection),
    groupedPoints,
    cutoffIndex: Math.round(cutoffIndex)
  }
}

export default connect(mapStateToProps)(MapView)
