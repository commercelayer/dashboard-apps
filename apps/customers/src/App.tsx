import { Routes } from "@commercelayer/app-elements"
import type { FC } from "react"
import { Router } from "wouter"
import { appRoutes } from "./data/routes"

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Routes
        routes={appRoutes}
        list={{
          home: {
            component: async () => await import("#pages/CustomerList"),
          },
          list: {
            component: async () => await import("#pages/ListRedirect"),
          },
          new: {
            component: async () => await import("#pages/CustomerNew"),
            overlay: true,
          },
          details: {
            component: async () => await import("#pages/CustomerDetails"),
          },
          edit: {
            component: async () => await import("#pages/CustomerEdit"),
            overlay: true,
          },
        }}
      />
    </Router>
  )
}
