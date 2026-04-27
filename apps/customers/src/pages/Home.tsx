import type { FC } from "react"
import { Redirect } from "wouter"
import { appRoutes } from "#data/routes"

const Page: FC = () => {
  return <Redirect to={appRoutes.list.makePath()} replace />
}

export default Page
