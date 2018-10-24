import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import PlaceIcon from 'material-ui/svg-icons/maps/place'
import PointsIcon from 'material-ui/svg-icons/image/grain'
import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'

import StateSelector from '../components/StateSelector'
import CountySelector from '../components/CountySelector'
import ZipCodeSelector, {ZipCodeSelectorHeadline} from '../components/ZipCodeSelector'
import CutoffSelector from '../components/CutoffSelector'
import LoadingOverlay from '../components/LoadingOverlay'
import CSVUploader from '../components/CSVUploader'
import {
  fetchCounties,
  fetchAreasFromCSVFile,
  selectCountyAction,
  removeCountyAction,
  selectCountyZipAndFetchAreas,
  removeCountyZipAndFetchAreas,
  setSelectAllCheckedAndFetchAreas,
  setSelectAllUnchecked,
  setCutoff,
  resetAreaSelector,
} from '../actions'
import styles from '../styles'
import types from '../types'

import ActionInfo from 'material-ui/svg-icons/action/info'

class Sidebar extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    counties: PropTypes.objectOf(types.countyShape),
    isLoading: PropTypes.bool.isRequired,
    selectedCounties: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedCountyZips: PropTypes.arrayOf(PropTypes.string).isRequired,
    cutoffIndex: PropTypes.number.isRequired,
    style: PropTypes.object.isRequired,
    selectedCSVFileName: PropTypes.string.isRequired,
    isSelectAllChecked: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props)
    props.dispatch(fetchCounties())
  }

  handleSelectCounty = county => {
    this.props.dispatch(selectCountyAction(county))
  };

  handleRemoveCounty = county => {
    this.props.dispatch(removeCountyAction(county))
  };

  handleSelectCountyZip = countyZip => {
    this.props.dispatch(selectCountyZipAndFetchAreas(countyZip))
  };

  handleRemoveCountyZip = countyZip => {
    this.props.dispatch(removeCountyZipAndFetchAreas(countyZip))
  };

  handleSelectAllChange = isInputChecked => {
    const {dispatch} = this.props
    if (isInputChecked) {
      dispatch(setSelectAllCheckedAndFetchAreas())
    } else {
      dispatch(setSelectAllUnchecked())
    }
  };

  handleCutoffChange = cutoffIndex =>
    this.props.dispatch(setCutoff(cutoffIndex));

  handleCSVFileSelected = file => {
    const {dispatch} = this.props
    dispatch(resetAreaSelector())
    dispatch(fetchAreasFromCSVFile(file))
  };

  handleClearInputsClick = () => {
    this.props.dispatch(resetAreaSelector())
  }

  render() {
    const {
      counties, isLoading, selectedCounties, selectedCountyZips,
      cutoffIndex, style, selectedCSVFileName, isSelectAllChecked,
    } = this.props
    const sidebarStyle = {
      display: 'block',
      zIndex: 2,
      overflowY: 'auto',
      padding: '30px 25px',
      width: 445
    }
    const areaSelectorStyle = {
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }
    return (
      <Paper style={{...style, ...sidebarStyle}}>
        <SidebarHeadline icon={PlaceIcon} text="Service Area" />
        <SidebarContent style={{flex: '1 1 0%', minHeight: 0}}>
          <CSVUploader
              selectedCSVFileName={selectedCSVFileName}
              onFileSelected={this.handleCSVFileSelected} />
          <InputSeparator />
          <div style={areaSelectorStyle}>
            {isLoading ? <LoadingOverlay /> : null}
            <StateSelector />
            <CountySelector
                selectedCounties={selectedCounties}
                counties={counties}
                onSelectCounty={this.handleSelectCounty}
                onRemoveCounty={this.handleRemoveCounty} />
            <ZipCodeSelectorHeadline
                nSelectedCountyZips={selectedCountyZips.length} />
            <ZipCodeSelector
                style={{flex: 1, overflow: 'auto'}}
                counties={counties}
                selectedCounties={selectedCounties}
                isSelectAllChecked={isSelectAllChecked}
                selectedCountyZips={selectedCountyZips}
                onSelectAllChange={this.handleSelectAllChange}
                onSelectCountyZip={this.handleSelectCountyZip}
                onRemoveCountyZip={this.handleRemoveCountyZip} />
          </div>
        </SidebarContent>
        <SidebarHeadline icon={PointsIcon} text="Enrollee Distribution" />
        <SidebarContent style={{ flex: 'none' }}>
          <CutoffSelector
            onChange={this.handleCutoffChange}
            value={cutoffIndex} />
          <span style={{
            color: styles.secondaryText,
            fontSize: 12,
            height: 24
          }}>Choose max allowable distance between any address and its nearest representative point</span>
        </SidebarContent>
        <FlatButton
          style={{alignSelf: 'flex-start', flex: 'none', marginTop: 20}}
          onClick={this.handleClearInputsClick}
          primary={true}
          label="clear inputs" />
      </Paper>
    )
  }
}


class SidebarHeadline extends Component {

  static propTypes = {
    icon: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    id: PropTypes.string,
  };

  render() {
    const {icon, text, id} = this.props
    const IconTag = icon
    const style = {
      display: 'flex',
      alignItems: 'center',
    }
    const iconStyle = {
      color: styles.secondaryText
    }
    const textStyle = {
      color: styles.primaryText,
      marginLeft: 23,
      textTransform: 'uppercase'
    }
    return (
      <div style={style}>
        <IconTag style={iconStyle} />
        <div style={textStyle}>
          {text}
        </div>
        <div style={{flex: 0.2}} />
        {id ? <TooltipIcon id={id} /> : null}
      </div>
    )
  }
}


class SidebarContent extends Component {

  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
  };

  render() {
    const {style} = this.props
    const contentStyle = {
      marginBottom: 15,
      paddingLeft: 46,
      paddingTop: 20,
      display: 'flex',
      flexDirection: 'column',
    }
    return (
      <div style={{...contentStyle, ...style}}>
        {this.props.children}
      </div>
    )
  }
}


class InputSeparator extends Component {

  render() {
    const style = {
      display: 'flex',
      alignItems: 'center',
      margin: '10px 0',
    }
    const lineStyle = {
      height: 0,
      borderTop: `1px solid ${styles.secondaryText}`,
      width: '40%',
    }
    const textStyle = {
      textAlign: 'center',
      flex: 1,
      color: styles.secondaryText,
      fontSize: 14,
      margin: '0 auto',
    }
    return (
      <div style={style}>
        <div style={lineStyle} />
        <div style={textStyle}>OR</div>
        <div style={lineStyle} />
      </div>
    )
  }
}

const TooltipIcon = ({id}) => {
  const style = {
    color: styles.secondaryText,
    width: 16,
    height: 16,
    verticalAlign: 'text-top',
  }
  return (
    <a data-tip data-for={id}>
      <ActionInfo style={style} />
    </a>
  )
}

TooltipIcon.propTypes = {
  id: PropTypes.string.isRequired,
}


const mapStateToProps = state => ({
  isLoading: state.isLoading.counties || state.isLoading.areas,
  counties: state.data.counties,
  selectedCounties: state.app.selectedCounties,
  selectedCountyZips: state.app.selectedCountyZips,
  cutoffIndex: state.app.cutoffIndex,
  selectedCSVFileName: state.app.selectedCSVFileName,
  isSelectAllChecked: state.app.isSelectAllChecked,
})

export default connect(mapStateToProps)(Sidebar)
