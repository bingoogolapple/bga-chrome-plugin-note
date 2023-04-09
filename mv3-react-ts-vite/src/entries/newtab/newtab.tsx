import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/style/index.less'
import App from './App'

import { testChrome } from '../../utils/chrome-utils'
testChrome('newtab')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// import '../../../scripts/crx-hmr-plugin/injectPage'
