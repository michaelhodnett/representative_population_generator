import React, {Component} from 'react'

import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'


class StateSelector extends Component {

  render() {
    return (
      <SelectField value='california'>
        <MenuItem value={'california'} primaryText="California" />
      </SelectField>
    )
  }
}

export default StateSelector
