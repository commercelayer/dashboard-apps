import { type FC, useEffect } from "react"
import { useLocation } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { appRoutes } from "#data/routes"

/**
 * The tags list used to live at `/list`, with `/` redirecting to it. That is now
 * the other way round, and this keeps the old path working — `useAppLinking`
 * builds `/<appSlug>/list` whenever an app links to another one without a
 * resource id, and existing bookmarks point here.
 *
 * Any query string is carried over, so a filtered link keeps its filters.
 */
export const ListRedirect: FC = () => {
  const [, setLocation] = useLocation()
  const search = useSearch()

  useEffect(() => {
    const queryString = new URLSearchParams(search).toString()
    setLocation(
      queryString === ""
        ? appRoutes.home.makePath()
        : `${appRoutes.home.makePath()}?${queryString}`,
      { replace: true },
    )
  }, [search])

  return null
}
