import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useState } from "react"
import { Link, useLocation, useRoute, useSearch } from "wouter"
import { SkuForm } from "#components/SkuForm"
import { appRoutes } from "#data/routes"
import { useSkuDetails } from "#hooks/useSkuDetails"
import { getFormValuesFromSku } from "#utils/getFormValuesFromSku"
import { getSkuFromFormValues } from "#utils/getSkuFromFormValues"

export function SkuEdit(): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  // carried through so returning to the list keeps its filters
  const queryString = useSearch()
  const [, params] = useRoute<{ skuId: string }>(appRoutes.edit.path)
  const skuId = params?.skuId ?? ""

  const { sku, isLoading, mutateSku } = useSkuDetails(skuId)
  const [apiError, setApiError] = useState<any>()

  const goBackUrl =
    skuId != null
      ? appRoutes.details.makePath(
          { skuId },
          new URLSearchParams(queryString).toString(),
        )
      : appRoutes.list.makePath({})

  if (!canUser("update", "skus")) {
    return (
      <PageLayout
        title="Edit SKU"
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
          title="Not found"
          description="Sku is invalid or you are not authorized to access this page."
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
        <SkeletonTemplate isLoading={isLoading}>Edit SKU</SkeletonTemplate>
      }
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
      <Spacer bottom="14">
        {!isLoading && sku != null ? (
          <SkuForm
            defaultValues={getFormValuesFromSku(sku)}
            apiError={apiError}
            onSubmit={(formValues) => {
              void sdkClient.skus
                .update(getSkuFromFormValues(formValues, sdkClient))
                .then(() => {
                  void mutateSku().then(() => {
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
