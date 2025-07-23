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
import { SWRConfig } from 'swr'
import { App } from './App'

import '@commercelayer/app-elements/vendor.css'

import '@commercelayer/app-elements/style.css'

const isDev = Boolean(import.meta.env.DEV)

const Main = (props: ClAppProps): React.JSX.Element => (
  <StrictMode>
    <ErrorBoundary hasContainer>
      <SWRConfig
        value={{
          revalidateOnFocus: false
        }}
      >
        <TokenProvider
          kind='webhooks'
          appSlug='webhooks'
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
      </SWRConfig>
    </ErrorBoundary>
  </StrictMode>
)

export default Main

createApp(Main, 'webhooks')
