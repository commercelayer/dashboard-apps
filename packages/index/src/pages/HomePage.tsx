import {
  Icon,
  ListItem,
  PageError,
  PageLayout,
  StatusIcon,
  Text
} from '@commercelayer/app-elements'
import { jwtDecode } from '@commercelayer/js-auth'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { type AllowedAppSlug } from '../appList'
import { appPromiseImports, humanReadable } from '../apps'

export function HomePage(): JSX.Element {
  const [visibility, setVisibility] = useState<
    Partial<Record<AllowedAppSlug, boolean>>
  >({})
  const [accessToken, setAccessToken] = useState<string | null>()

  useEffect(function checkApplications() {
    Object.entries(appPromiseImports).forEach(([, { exists, app }]) => {
      void exists().then((visible) => {
        setVisibility((prev) => ({ ...prev, [app.slug]: visible }))
      })
    })
  }, [])

  useEffect(function checkAccessToken() {
    const cookieName = 'cl-dashboard-app-access-token'
    const searchParams = new URLSearchParams(location.search)
    const accessTokenFromUrl = searchParams.get('accessToken')

    if (accessTokenFromUrl != null) {
      Cookies.set(cookieName, accessTokenFromUrl, {
        expires: new Date(jwtDecode(accessTokenFromUrl).payload.exp * 1000)
      })
      searchParams.delete('accessToken')
      window.history.replaceState('', document.title, `/`)
    }

    const accessTokenFromCookie = Cookies.get('cl-dashboard-app-access-token')

    if (accessTokenFromCookie != null) {
      setAccessToken(accessTokenFromCookie)
    } else {
      setAccessToken(null)
    }
  }, [])

  if (accessToken === undefined) {
    return <div />
  }

  if (accessToken === null) {
    return (
      <PageError
        errorName='Invalid token'
        errorDescription='The provided authorization token is not valid'
      />
    )
  }

  return (
    <PageLayout title='App router'>
      {Object.entries(appPromiseImports)
        .sort(([, a], [, b]) =>
          a.app.name < b.app.name ? -1 : a.app.name > b.app.name ? 1 : 0
        )
        .map(([, { app }]) => {
          return (
            visibility[app.slug] === true && (
              <ListItem
                key={app.slug}
                href={`/${app.slug}?accessToken=${accessToken}`}
                icon={
                  <div className='bg-gray-50 rounded p-2'>
                    <Icon name={app.icon} className='text-primary' size={24} />
                  </div>
                }
              >
                <Text weight='bold'>{humanReadable(app.slug)}</Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            )
          )
        })}
    </PageLayout>
  )
}
