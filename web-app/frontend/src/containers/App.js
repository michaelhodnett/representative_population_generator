import 'babel-polyfill';

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import Snackbar from 'material-ui/Snackbar'

import './App.css';
import Sidebar from './Sidebar'
import TableView from './TableView'
import MapView from './MapView'
import Header from '../components/Header'
import ViewModeSwitcher from '../components/ViewModeSwitcher'
import MissingAreasDialog from '../components/MissingAreasDialog'
import {setViewMode, resetMissingAreas, resetSnackMessage} from '../actions'
import types from '../types'


class App extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    viewMode: PropTypes.string.isRequired,
    missingAreas: PropTypes.arrayOf(types.missingAreasShape).isRequired,
    snackMessage: PropTypes.string.isRequired,
  };

  handleViewModeChange = viewMode => {
    this.props.dispatch(setViewMode(viewMode))
  };

  handleMissingAreasCloseClick = () => {
    this.props.dispatch(resetMissingAreas())
  };

  handleSnackbarRequestClose = () => {
    this.props.dispatch(resetSnackMessage())
  };

  render() {
    const {viewMode, missingAreas, snackMessage} = this.props
    const fullContainerStyle = {
      height: '100%',
      width: '100%',
    }
    const switcherStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 80,
    }
    return (
      <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <MissingAreasDialog
            isOpen={!!missingAreas.length}
            missingAreas={missingAreas}
            onCloseClick={this.handleMissingAreasCloseClick} />
        <Snackbar
            open={!!snackMessage}
            message={snackMessage}
            autoHideDuration={8000}
            onRequestClose={this.handleSnackbarRequestClose} />
        <Header />
        <div style={{display: 'flex', flex: 1, position: 'relative'}}>
          <Sidebar style={{height: '100%', display: 'flex', flexDirection: 'column'}} />
          <div style={{position: 'relative', ...fullContainerStyle}}>
            <ViewModeSwitcher
                style={switcherStyle}
                viewMode={viewMode}
                onViewModeClick={this.handleViewModeChange} />
            {viewMode === 'map' ?
              <MapView style={fullContainerStyle} /> :
              <TableView style={{paddingTop: 80, height: 'calc(100% - 80px)'}} />
            }
          </div>
        </div>
      </div>
    );
  }
}


const mapStateToProps = ({app: {viewMode, missingAreas, snackMessage}}) => ({
  viewMode,
  missingAreas,
  snackMessage,
})


export default connect(mapStateToProps)(App)
