import React, {Component} from 'react'

import CircularProgress from 'material-ui/CircularProgress'


class LoadingOverlay extends Component {

  render() {
    const style = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    }
    return (
      <div style={style}>
        <CircularProgress />
      </div>
    )
  }
}

export default LoadingOverlay
