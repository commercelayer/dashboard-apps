import { type FC, useEffect } from "react"

export const ScrollToTop: FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [window.location.pathname])

  return null
}
