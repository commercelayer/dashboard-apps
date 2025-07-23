import {
  CoreSdkProvider,
  ErrorBoundary,
  I18NProvider,
  MetaTags,
  TokenProvider,
  createApp,
  type ClAppProps
} from '@commercelayer/app-elements'
import { StrictMode } from 'react'
import { App } from './App'

import '@commercelayer/app-elements/vendor.css'

import '@commercelayer/app-elements/style.css'

const isDev = Boolean(import.meta.env.DEV)

const Main = (props: ClAppProps): React.JSX.Element => (
  <StrictMode>
    <ErrorBoundary hasContainer>
      <TokenProvider
        kind='exports'
        appSlug='exports'
        devMode={isDev}
        loadingElement={<div />}
        {...props}
      >
        <I18NProvider>
          <CoreSdkProvider>
            <MetaTags />
            <App routerBase={props?.routerBase} />
          </CoreSdkProvider>
        </I18NProvider>
      </TokenProvider>
    </ErrorBoundary>
  </StrictMode>
)

export default Main

createApp(Main, 'exports')
