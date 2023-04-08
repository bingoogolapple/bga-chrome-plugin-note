import React from 'react'
import ReactDOM from 'react-dom/client'
import '../../style/index.css'
import App from './App'

import { testChrome } from '../../utils/chrome-utils'
testChrome('popup')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
