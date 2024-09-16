import type { GetParams } from '@commercelayer/app-elements'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Suspense, lazy } from 'react'
import type { SetRequired } from 'type-fest'
import type {
  RouteComponentProps,
  RouteProps as WouterRouteProps
} from 'wouter'
import { Switch, Route as WouterRoute, useLocation } from 'wouter'

export function Routes<T extends Record<string, { path: string }>>({
  routes,
  list
}: {
  routes: T
  list: {
    [key in keyof T]: {
      component: () => Promise<{ default: React.ComponentType<any> }>
      overlay?: boolean
    }
  }
}): JSX.Element {
  return (
    <Switch>
      {Object.entries(list).map(([key, { component, ...props }]) => {
        const route = routes[key]

        if (route?.path == null) {
          throw new Error(
            'Missing configuration when defining <Routes routes=".." list=".." />'
          )
        }

        return (
          <Route
            key={route.path}
            path={route.path}
            component={lazy(component)}
            {...props}
          />
        )
      })}

      <Route component={GenericPageNotFound} />
    </Switch>
  )
}

export type PageProps<
  Route extends {
    makePath: (...arg: any[]) => string
  }
> = RouteComponentProps<GetParams<Route>> & { overlay?: boolean }

function Route({
  path,
  component: Component,
  ...rest
}: SetRequired<WouterRouteProps<any>, 'component'> & {
  overlay?: boolean
}): React.ReactNode {
  return (
    <WouterRoute path={path}>
      {(params) => {
        return (
          <Suspense fallback={<LoadingPage overlay={rest.overlay} />}>
            <Component params={params} {...rest} />
          </Suspense>
        )
      }}
    </WouterRoute>
  )
}

function LoadingPage({ overlay = false }: { overlay?: boolean }): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  return (
    <div style={overlay ? { backgroundColor: '#F5F5F5' } : undefined}>
      <SkeletonTemplate isLoading>
        <PageLayout
          title={<SkeletonTemplate isLoading>Gift cards</SkeletonTemplate>}
          mode={mode}
          gap='only-top'
        >
          <div />
        </PageLayout>
      </SkeletonTemplate>
    </div>
  )
}

export function GenericPageNotFound(): JSX.Element {
  const [, setLocation] = useLocation()
  return (
    <PageLayout title=''>
      <EmptyState
        title='Page Not found'
        description='We could not find the page you are looking for.'
        action={
          <Button
            size='regular'
            onClick={() => {
              setLocation('/')
            }}
          >
            Go home
          </Button>
        }
      />
    </PageLayout>
  )
}
