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
import { SWRConfig } from 'swr'
import { App } from './App'

const isDev = Boolean(import.meta.env.DEV)

const Main: React.FC<ClAppProps> = (props) => (
  <StrictMode>
    <ErrorBoundary hasContainer>
      <SWRConfig
        value={{
          revalidateOnFocus: false
        }}
      >
        <TokenProvider
          kind='shipments'
          appSlug='shipments'
          devMode={isDev}
          loadingElement={<div />}
          {...props}
        >
          <CoreSdkProvider>
            <MetaTags />
            <App routerBase={props?.routerBase} />
          </CoreSdkProvider>
        </TokenProvider>
      </SWRConfig>
    </ErrorBoundary>
  </StrictMode>
)

export default Main

createApp(Main, 'shipments')
