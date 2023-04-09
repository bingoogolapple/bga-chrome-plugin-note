import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/style/index.less'
import App from './App'

import { testChrome } from '../../utils/chrome-utils'
testChrome('devtools-panel')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
