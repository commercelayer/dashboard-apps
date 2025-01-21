import { appRoutes } from '#data/routes'
import { type FC } from 'react'
import { Redirect } from 'wouter'

const Page: FC = () => {
  return <Redirect to={appRoutes.list.makePath()} />
}

export default Page
