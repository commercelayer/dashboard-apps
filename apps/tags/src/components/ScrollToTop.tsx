import { useEffect, type FC } from 'react'

export const ScrollToTop: FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [window.location.pathname])

  return null
}
