import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Home } from '#pages/Home'
import { PriceDetails } from '#pages/PriceDetails'
import { PriceEdit } from '#pages/PriceEdit'
import { PriceListEdit } from '#pages/PriceListEdit'
import { PriceListNew } from '#pages/PriceListNew'
import { PriceNew } from '#pages/PriceNew'
import { PriceTierEdit } from '#pages/PriceTierEdit'
import { PriceTierNew } from '#pages/PriceTierNew'
import { PricesList } from '#pages/PricesList'
import type { FC } from 'react'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.home.path} component={Home} />
        <Route path={appRoutes.priceListNew.path} component={PriceListNew} />
        <Route path={appRoutes.priceListEdit.path} component={PriceListEdit} />
        <Route path={appRoutes.pricesList.path} component={PricesList} />
        <Route path={appRoutes.priceNew.path} component={PriceNew} />
        <Route path={appRoutes.priceEdit.path} component={PriceEdit} />
        <Route path={appRoutes.priceDetails.path} component={PriceDetails} />
        <Route
          path={appRoutes.priceFrequencyTierEdit.path}
          component={PriceTierEdit}
        />
        <Route
          path={appRoutes.priceFrequencyTierNew.path}
          component={PriceTierNew}
        />
        <Route
          path={appRoutes.priceVolumeTierEdit.path}
          component={PriceTierEdit}
        />
        <Route
          path={appRoutes.priceVolumeTierNew.path}
          component={PriceTierNew}
        />
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
