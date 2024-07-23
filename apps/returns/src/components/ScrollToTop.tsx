import { type FC, useEffect } from 'react'
import { useLocation } from 'wouter'

export const ScrollToTop: FC = () => {
  const [pathname] = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
