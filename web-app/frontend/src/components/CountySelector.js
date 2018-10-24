import React, {Component} from 'react'
import PropTypes from 'prop-types'
import _ from 'underscore'

import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import types from '../types'

class CountySelector extends Component {

  static propTypes = {
    counties: PropTypes.objectOf(types.countyShape),
    selectedCounties: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectCounty: PropTypes.func.isRequired,
    onRemoveCounty: PropTypes.func.isRequired,
  };

  handleChange = (event, index, values) => {
    const {selectedCounties, onSelectCounty, onRemoveCounty} = this.props
    const removedValues = _.difference(selectedCounties, values)
    removedValues.forEach(value => onRemoveCounty(value))
    const selectedValues = _.difference(values, selectedCounties)
    selectedValues.forEach(value => onSelectCounty(value))
  };

  render() {
    const {counties, selectedCounties} = this.props
    return (
      <SelectField
          multiple={true}
          hintText="Select counties"
          value={selectedCounties}
          onChange={this.handleChange}>
        {Object.keys(counties || {}).sort().map(countyKey => (
          <MenuItem
              key={countyKey}
              insetChildren={true}
              checked={selectedCounties && selectedCounties.includes(countyKey)}
              value={countyKey}
              primaryText={countyKey} />
        ))}
      </SelectField>
    )
  }
}

export default CountySelector
