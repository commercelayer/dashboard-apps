import type { FC } from "react"
import { Redirect } from "wouter"
import { appRoutes } from "#data/routes"

const Home: FC = () => {
  return <Redirect to={appRoutes.list.path} replace />
}

export default Home
