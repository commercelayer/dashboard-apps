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
import { SWRConfig } from 'swr'
import { App } from './App'

const isDev = Boolean(import.meta.env.DEV)

const Main = (props: ClAppProps): React.JSX.Element => {
  return (
    <StrictMode>
      <ErrorBoundary hasContainer>
        <SWRConfig
          value={{
            revalidateOnFocus: false
          }}
        >
          <TokenProvider
            kind='promotions'
            appSlug='promotions'
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
}

export default Main

createApp(Main, 'promotions')
