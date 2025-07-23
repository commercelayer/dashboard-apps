import { createApp } from '@commercelayer/app-elements'
import { App } from './App'

import '@commercelayer/app-elements/vendor.css'

import '@commercelayer/app-elements/style.css'

createApp((props) => <App {...props} />, 'index')
