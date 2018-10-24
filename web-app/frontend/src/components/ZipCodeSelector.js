import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Checkbox from 'material-ui/Checkbox'

import styles from '../styles'
import types from '../types'


class ZipCodeSelector extends Component {

  static propTypes = {
    onSelectCountyZip: PropTypes.func.isRequired,
    onRemoveCountyZip: PropTypes.func.isRequired,
    onSelectAllChange: PropTypes.func.isRequired,
    counties: PropTypes.objectOf(types.countyShape),
    selectedCounties: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedCountyZips: PropTypes.arrayOf(PropTypes.string).isRequired,
    style: PropTypes.object,
    isSelectAllChecked: PropTypes.bool.isRequired,
  };

  handleChange = (countyZipKey, isInputChecked) => {
    const {onSelectCountyZip, onRemoveCountyZip} = this.props
    if (isInputChecked) {
      onSelectCountyZip(countyZipKey)
    } else {
      onRemoveCountyZip(countyZipKey)
    }
  };

  render() {
    const {
      onSelectAllChange, counties, selectedCounties, selectedCountyZips,
      style, isSelectAllChecked,
    } = this.props
    if (!counties) {
      return null
    }
    return (
      <div style={style}>
        {selectedCounties.length ? <Checkbox
            checked={isSelectAllChecked}
            label="Select All"
            onCheck={(e, isInputChecked) => onSelectAllChange(isInputChecked)} /> :
          null}
        {(selectedCounties || []).sort().map(countyKey => {
          const county = counties[countyKey]
          // The 151px max-height ensures that we show 4.5 items
          // (the .5 is an affordance that the list is scrollable)
          return <List key={countyKey}>
            <Subheader style={{marginBottom: '-16px'}}>
              {countyKey}
            </Subheader>
            <div style={{maxHeight: 151, overflowY: 'auto'}}>
              {county.zips.sort().map(zip => {
                const countyZipKey = countyKey + '-' + zip
                const checkbox = <Checkbox
                    checked={selectedCountyZips.includes(countyZipKey)}
                    onCheck={(e, isInputChecked) => this.handleChange(countyZipKey, isInputChecked)} />
                return <ListItem
                    innerDivStyle={{height: 10, padding: '16px 16px 6px 72px'}}
                    key={countyZipKey}
                    primaryText={zip}
                    leftCheckbox={checkbox} />
                })}
            </div>
          </List>
        })}
      </div>
    )
  }
}


const ZipCodeSelectorHeadline = ({nSelectedCountyZips}) => (
  <div style={{display: 'flex', flex: 'none', marginTop: 5}}>
    <div style={{marginBottom: 15, color: styles.primaryText}}>
      ZIP Codes
    </div>
    <div style={{flex: 1}} />
    <div style={{color: styles.secondaryText}}>
      {nSelectedCountyZips} selected
    </div>
  </div>
)
ZipCodeSelectorHeadline.propTypes = {
  nSelectedCountyZips: PropTypes.number.isRequired
}
export {ZipCodeSelectorHeadline}


export default ZipCodeSelector
