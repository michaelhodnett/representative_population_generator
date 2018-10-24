import React from 'react'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

// TODO: is it safe to use a Map instead?
const OPTIONS = [
  [3, '0.5 miles'],
  [2, '2.5 miles'],
  [1, '5 miles']
]

const CutoffSelector = ({ onChange, value }) =>
  <SelectField
    value={OPTIONS.find(([val]) => val === value)[0]}
    onChange={(_, __, value) => onChange(value)}
  >
    {OPTIONS.map(([val, text]) =>
      <MenuItem
        checked={value === val}
        key={val}
        primaryText={text}
        value={val}
      />
    )}
  </SelectField>;

export default CutoffSelector;
