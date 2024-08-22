import {
  CoreSdkProvider,
  ErrorBoundary,
  MetaTags,
  TokenProvider,
  createApp,
  type ClAppProps
} from '@commercelayer/app-elements'
import '@commercelayer/app-elements/style.css'
import { StrictMode } from 'react'
import { App } from './App'

const isDev = Boolean(import.meta.env.DEV)

const Main: React.FC<ClAppProps> = (props) => (
  <StrictMode>
    <ErrorBoundary hasContainer>
      <TokenProvider
        kind='exports'
        appSlug='exports'
        devMode={isDev}
        loadingElement={<div />}
        {...props}
      >
        <CoreSdkProvider>
          <MetaTags />
          <App routerBase={props?.routerBase} />
        </CoreSdkProvider>
      </TokenProvider>
    </ErrorBoundary>
  </StrictMode>
)

export default Main

createApp(Main, 'exports')
