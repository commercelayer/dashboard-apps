import type { FC } from "react"
import { Route, Router, Switch, useRoute } from "wouter"
import { appRoutes } from "#data/routes"
import GiftCardDetails from "#pages/GiftCardDetails"
import GiftCardEdit from "#pages/GiftCardEdit"
import GiftCardList from "#pages/GiftCardList"
import GiftCardNew from "#pages/GiftCardNew"
import ListRedirect from "#pages/ListRedirect"

interface AppProps {
  routerBase?: string
}

/**
 * The list stays mounted while the details drawer is open, so opening a gift card
 * costs no refetch and closing it reveals the list as it was. `Switch` would
 * render only one of them, hence the two conditions rather than routes.
 */
const GiftCardsScreen: FC = () => {
  const [isList] = useRoute(appRoutes.home.path)
  const [isDetails, detailsParams] = useRoute<{ giftCardId: string }>(
    appRoutes.details.path,
  )

  return (
    <>
      {(isList || isDetails) && <GiftCardList />}
      {isDetails && (
        <GiftCardDetails params={{ giftCardId: detailsParams?.giftCardId }} />
      )}
      {!isList && !isDetails && (
        <Switch>
          <Route path={appRoutes.list.path}>
            <ListRedirect />
          </Route>
          <Route path={appRoutes.new.path} component={GiftCardNew} />
          <Route path={appRoutes.edit.path} component={GiftCardEdit} />
        </Switch>
      )}
    </>
  )
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <GiftCardsScreen />
    </Router>
  )
}
