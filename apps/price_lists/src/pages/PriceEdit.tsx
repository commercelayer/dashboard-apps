import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { PriceUpdate } from "@commercelayer/sdk"
import { useState } from "react"
import { Link, useLocation, useRoute, useSearch } from "wouter"
import { PriceForm, type PriceFormValues } from "#components/PriceForm"
import { appRoutes } from "#data/routes"
import { usePriceDetails } from "#hooks/usePriceDetails"

export function PriceEdit(): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  // carried through so returning to the list keeps its filters
  const queryString = useSearch()
  const [apiError, setApiError] = useState<any>()

  const [, params] = useRoute<{ priceId: string }>(appRoutes.priceEdit.path)
  const priceId = params?.priceId ?? ""

  const { price, isLoading, mutatePrice } = usePriceDetails(priceId)
  const priceListId = price?.price_list?.id ?? ""
  const pageTitle = "Edit price"

  const goBackUrl = appRoutes.priceDetails.makePath(
    { priceId },
    new URLSearchParams(queryString).toString(),
  )

  if (!canUser("update", "prices")) {
    return (
      <PageLayout
        title={pageTitle}
        navigationButton={{
          onClick: () => {
            setLocation(goBackUrl)
          },
          label: "Cancel",
          icon: "x",
        }}
        scrollToTop
        overlay
      >
        <EmptyState
          title="Permission Denied"
          description="You are not authorized to access this page."
          action={
            <Link href={goBackUrl}>
              <Button variant="primary">Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: "Cancel",
        icon: "x",
      }}
      gap="only-top"
      scrollToTop
      overlay
    >
      <Spacer bottom="14">
        {!isLoading && price != null ? (
          <PriceForm
            resource={price}
            defaultValues={{
              id: price.id,
              currency_code: price.currency_code?.toString(),
              price: price.amount_cents,
              original_price: price.compare_at_amount_cents ?? 0,
              item: price.sku?.id,
              price_list: price.price_list?.id,
            }}
            apiError={apiError}
            onSubmit={(formValues) => {
              const price = adaptFormValuesToPrice(formValues, priceListId)
              void sdkClient.prices
                .update(price)
                .then(() => {
                  void mutatePrice().then(() => {
                    setLocation(goBackUrl)
                  })
                })
                .catch((error) => {
                  setApiError(error)
                })
            }}
          />
        ) : null}
      </Spacer>
    </PageLayout>
  )
}

function adaptFormValuesToPrice(
  formValues: PriceFormValues,
  priceListId: string,
): PriceUpdate {
  return {
    id: formValues.id ?? "",
    amount_cents: formValues.price,
    compare_at_amount_cents: formValues.original_price,
    sku: {
      id: formValues.item ?? null,
      type: "skus",
    },
    price_list: {
      id: priceListId,
      type: "price_lists",
    },
  }
}
