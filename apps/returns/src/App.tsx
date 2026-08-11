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
            component: async () => await import("#pages/ReturnsList"),
          },
          list: {
            component: async () => await import("#pages/ListRedirect"),
          },
          details: {
            component: async () => await import("#pages/ReturnDetails"),
          },
          restock: {
            component: async () => await import("#pages/RestockReturn"),
          },
          refund: {
            component: async () => await import("#pages/Refund"),
          },
        }}
      />
    </Router>
  )
}
