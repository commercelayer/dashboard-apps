import { createApp } from '@commercelayer/app-elements'
import '@commercelayer/app-elements/style.css'
import { App } from './App'

createApp(
  (props) => <App {...props} />,
  // @ts-expect-error This is an hack.
  'index'
)
