import {
  PageLayout,
  Spacer,
  useAppLinking,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { FC } from "react"
import { useLocation } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { useGiftCardsTableColumns } from "#components/giftCardsTableColumns"
import { ListEmptyState } from "#components/ListEmptyState"
import { instructions } from "#data/filters"
import { appRoutes } from "#data/routes"
import { giftCardsTableSettings } from "#data/tableSettings"

const GiftCardList: FC = () => {
  const { canUser } = useTokenProvider()
  const { navigateTo } = useAppLinking()
  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { FilteredTable, FiltersBar, FiltersDrawer, hasActiveFilter } =
    useResourceFilters({
      instructions,
      tableSettings: giftCardsTableSettings,
    })

  const columns = useGiftCardsTableColumns()

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  return (
    <PageLayout
      title="Gift cards"
      fullWidth
      toolbar={{
        buttons: canUser("create", "gift_cards")
          ? [
              {
                icon: "plus",
                label: "New gift card",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.new.makePath({}))
                },
              },
            ]
          : undefined,
      }}
    >
      <FiltersBar
        queryString={queryString}
        onUpdate={handleFiltersUpdate}
        searchBarDebounceMs={1000}
      />

      <Spacer bottom="14">
        <FilteredTable
          type="gift_cards"
          columns={columns}
          query={{
            fields: {
              gift_cards: [
                "id",
                "code",
                "status",
                "currency_code",
                "formatted_balance",
                "formatted_initial_balance",
                "created_at",
                "updated_at",
                "expires_at",
                "reference",
                "gift_card_recipient",
                "tags",
              ],
              tags: ["id", "name"],
            },
            // the Customer column reads the recipient's customer, or its email;
            // the Tags column reads the tags
            include: [
              "gift_card_recipient",
              "gift_card_recipient.customer",
              "tags",
            ],
            pageSize: 25,
          }}
          // columns the user turns on may not fit: past that point the table
          // scrolls sideways rather than squeezing them
          layout="fit-or-scroll"
          hideTitle
          getRowHref={(giftCard) =>
            navigateTo({ app: "gift_cards", resourceId: giftCard.id })?.href
          }
          onRowClick={(giftCard, event) => {
            navigateTo({ app: "gift_cards", resourceId: giftCard.id })?.onClick(
              event as React.MouseEvent<HTMLAnchorElement>,
            )
          }}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? "userFiltered" : "history"}
            />
          }
        />
      </Spacer>

      <FiltersDrawer onUpdate={handleFiltersUpdate} />
    </PageLayout>
  )
}

export default GiftCardList
