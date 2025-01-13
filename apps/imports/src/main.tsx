import {
  CoreSdkProvider,
  ErrorBoundary,
  I18NProvider,
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
        kind='imports'
        appSlug='imports'
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

createApp(Main, 'imports')
