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
            component: async () => await import("#pages/ShipmentList"),
          },
          list: {
            component: async () => await import("#pages/ListRedirect"),
          },
          details: {
            component: async () => await import("#pages/ShipmentDetails"),
          },
          packing: {
            component: async () => await import("#pages/Packing"),
          },
          purchase: {
            component: async () => await import("#pages/Purchase"),
          },
        }}
      />
    </Router>
  )
}
