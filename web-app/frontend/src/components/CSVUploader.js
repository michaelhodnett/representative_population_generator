import React, {Component} from 'react'
import PropTypes from 'prop-types'

import RaisedButton from 'material-ui/RaisedButton'

import styles from '../styles'


class CSVUploader extends Component {

  static propTypes = {
    onFileSelected: PropTypes.func.isRequired,
    selectedCSVFileName: PropTypes.string.isRequired,
  };

  handleFileSelect = e => {
    const {onFileSelected} = this.props
    onFileSelected && onFileSelected(e.target.files[0])
  };

  render() {
    const {selectedCSVFileName} = this.props
    const fileNameStyle = {
      maxWidth: 250,
      color: styles.secondaryText,
      marginTop: 10,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      fontSize: '12px',
      height: '24px'
    }
    return (
      <div>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div>
            <RaisedButton
              containerElement="label"
              primary={true}
              label="upload CSV"
            >
              <input
                onChange={this.handleFileSelect}
                type="file"
                accept=".csv"
                style={{display: 'none'}} />
            </RaisedButton>
            {selectedCSVFileName ?
              <div style={fileNameStyle}>
                Uploaded - {selectedCSVFileName}
              </div>:
              <div style={fileNameStyle}>
                Upload valid ZIP Codes and/or Counties
              </div>
            }
            <div style={{flex: 1, height: '2px'}} />
          </div>
        </div>
      </div>
    )
  }
}

export default CSVUploader
