import { type FC, useEffect } from "react"
import { useLocation } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { appRoutes } from "#data/routes"

/**
 * The stock transfers list used to be a page of its own at `/list`, before the
 * entry page at `/` became a tabbed table. Only the redirect is kept, because the
 * path is still reachable: `useAppLinking` builds `/<appSlug>/list` whenever an
 * app links to another one without a resource id, and existing bookmarks point
 * here too.
 *
 * Any query string is carried over, so a filtered link keeps its filters.
 */
export const ListRedirect: FC = () => {
  const [, setLocation] = useLocation()
  const search = useSearch()

  useEffect(() => {
    setLocation(appRoutes.home.makePath({}, search), { replace: true })
  }, [search])

  return null
}
