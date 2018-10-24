import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table'

import types from '../types'


class MissingAreasDialog extends Component {

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onCloseClick: PropTypes.func.isRequired,
    missingAreas: PropTypes.arrayOf(types.missingAreasShape).isRequired,
  };

  render() {
    const {isOpen, onCloseClick, missingAreas} = this.props
    const actions = [
      <FlatButton label="Close" primary={true} onClick={onCloseClick} />,
    ];
    return (
      <Dialog
          title="Missing Service Areas"
          open={isOpen}
          autoScrollBodyContent={true}
          onRequestClose={onCloseClick}
          actions={actions}>
        <p>
          The following service areas could not be found in our database.
        </p>
        <Table selectable={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>County</TableHeaderColumn>
              <TableHeaderColumn>ZipCode</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {missingAreas.map((areaInfo, i) => (
              <TableRow key={i}>
                <TableRowColumn>{areaInfo.countyName}</TableRowColumn>
                <TableRowColumn>{areaInfo.zipCode}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Dialog>
    )
  }
}

export default MissingAreasDialog
