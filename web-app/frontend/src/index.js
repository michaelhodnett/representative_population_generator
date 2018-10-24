import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './containers/AppContainer';
import registerServiceWorker from './registerServiceWorker';

const rootEl = document.getElementById('root')

ReactDOM.render(
  <AppContainer />,
  rootEl
)

if (module.hot) {
  module.hot.accept('./containers/AppContainer', () => {
    const NextApp = require('./containers/AppContainer').default
    ReactDOM.render(
      <NextApp />,
      rootEl
    )
  })
}
registerServiceWorker();
