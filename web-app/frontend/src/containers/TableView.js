import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table'
import FlatButton from 'material-ui/FlatButton'
import FileDownloadIcon from 'material-ui/svg-icons/file/file-download'

import LoadingOverlay from '../components/LoadingOverlay'
import styles from '../styles'
import {getAllPoints} from './tableViewSelectorHelpers'

var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
const {CSVLink} = isIE11 ? require('react-csv-ie11patch') : require('react-csv-chromepatch')

const MAX_DISPLAY_POINTS = 500

const tableHeaders = {
  'zipCode': 'ZIP Code',
  'county': 'County',
  'population': 'No. Residents',
  'latitude': 'Latitude',
  'longitude': 'Longitude',
  'censusTract': 'Tract',
  'censusBlockGroup': 'Block Group'};

class TableView extends Component {

  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    points: PropTypes.arrayOf(PropTypes.shape({
      zipCode: PropTypes.string.isRequired,
      county: PropTypes.string.isRequired,
      longitude: PropTypes.number.isRequired,
      latitude: PropTypes.number.isRequired,
      population: PropTypes.arrayOf(PropTypes.number).isRequired,
      censusTract: PropTypes.number.isRequired,
      censusBlockGroup: PropTypes.number.isRequired,
    })).isRequired,
    nAreas: PropTypes.number.isRequired,
    cutoffIndex: PropTypes.number.isRequired,
    style: PropTypes.object,
  };

  render() {
    const { isLoading, nAreas, cutoffIndex, style } = this.props
    const points = deserializePoints(this.props.points, cutoffIndex)
    const tableViewStyle = {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: 20,
      paddingRight: 20,
      position: 'relative',
    }
    const noticeStyle = {
      color: styles.secondaryText,
    }
    return (
      <div style={{...tableViewStyle, ...style}}>
        {isLoading ? <LoadingOverlay /> : null}
        <div style={{display: 'flex', alignItems: 'center', paddingTop: 30}}>
          <div style={{fontSize: 20}}>
            Representative Points of Enrollees&nbsp;
          </div>
          <div style={{flex: '1'}} />
          <CSVLink filename={ "service_area_points_" + Date.now() + ".csv" } data={renameHeaders(points)}>
            <FlatButton style={{color: '#3F51B5'}} label="csv" icon={<FileDownloadIcon />} />
          </CSVLink>
        </div>
        {points.length > MAX_DISPLAY_POINTS ?
          <div style={noticeStyle}>Displaying first {MAX_DISPLAY_POINTS} out of {points.length} records for {nAreas} service area{nAreas > 1 ? 's' : null}</div> :
          <div style={noticeStyle}>
            Displaying {points.length} records for {nAreas} service area{nAreas > 1 ? 's' : null}
          </div>
        }
        <Table selectable={false} wrapperStyle={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn></TableHeaderColumn>
              <TableHeaderColumn>ZIP Code</TableHeaderColumn>
              <TableHeaderColumn>County</TableHeaderColumn>
              <TableHeaderColumn>No. Residents</TableHeaderColumn>
              <TableHeaderColumn>Latitude</TableHeaderColumn>
              <TableHeaderColumn>Longitude</TableHeaderColumn>
              <TableHeaderColumn>Tract</TableHeaderColumn>
              <TableHeaderColumn>Block Group</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false} style={{overflowY: 'scroll', flex: 1}}>
            {points.slice(0, MAX_DISPLAY_POINTS).map((point, i) => (
              <TableRow key={i}>
                <TableRowColumn>{i}</TableRowColumn>
                <TableRowColumn>{point.zipCode}</TableRowColumn>
                <TableRowColumn>{point.county}</TableRowColumn>
                <TableRowColumn>{point.population}</TableRowColumn>
                <TableRowColumn>{point.latitude}</TableRowColumn>
                <TableRowColumn>{point.longitude}</TableRowColumn>
                <TableRowColumn>{point.censusTract}</TableRowColumn>
                <TableRowColumn>{point.censusBlockGroup}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}

function deserializePoints(points, cutoffIndex) {
  return points.map(_ => ({
    ..._,
    population: _.population[Math.min(cutoffIndex, _.population.length)-1]
  }))
}

function renameHeaders(points) {
  var newPoints = [];
  for(var i = 0; i < points.length; i++)
  {
    var point = Object.assign({}, points[i]);
    for (var originalHeader in tableHeaders) {
      var newHeader = tableHeaders[originalHeader]
      point[newHeader] = point[originalHeader];
      delete(point[originalHeader]);
    }
    newPoints.push(point);
  }
  return newPoints;
}

const mapStateToProps = ({data: {areas}, app: {cutoffIndex}, isLoading}) => {
  return {
    isLoading: isLoading.counties || isLoading.areas,
    points: getAllPoints(areas, cutoffIndex),
    nAreas: areas.length,
    cutoffIndex: Math.round(cutoffIndex)
  }
}


export default connect(mapStateToProps)(TableView)
