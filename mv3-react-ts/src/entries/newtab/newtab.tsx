import React from 'react'
import ReactDOM from 'react-dom'
import '../../style/index.css'
import App from './App'

import { testChrome } from '../../utils/chrome-utils'
testChrome('newtab')

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
