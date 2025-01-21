import { appRoutes } from '#data/routes'
import type { FC } from 'react'
import { Redirect } from 'wouter'

const Home: FC = () => {
  return <Redirect to={appRoutes.list.path} replace />
}

export default Home
