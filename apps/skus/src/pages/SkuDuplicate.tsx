import { Button, EmptyState, PageLayout } from "@commercelayer/app-elements"
import { Link, useLocation, useRoute, useSearch } from "wouter"
import type { SkuFormValues } from "#components/SkuForm"
import { appRoutes } from "#data/routes"
import { useSkuDetails } from "#hooks/useSkuDetails"
import { SkuCreatePage } from "#pages/SkuNew"
import { getFormValuesFromSku } from "#utils/getFormValuesFromSku"

export function SkuDuplicate(): React.JSX.Element {
  // carried through so returning to the list keeps its filters
  const queryString = useSearch()
  const [, params] = useRoute<{ skuId: string }>(appRoutes.duplicate.path)
  const skuId = params?.skuId ?? ""

  const [, setLocation] = useLocation()

  const { sku, isLoading, error } = useSkuDetails(skuId)

  const goBackUrl = appRoutes.details.makePath(
    { skuId },
    new URLSearchParams(queryString).toString(),
  )

  // on error `sku` holds the mock fallback, which must not end up in the form
  if (error != null) {
    return (
      <PageLayout
        title="New SKU"
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
    <SkuCreatePage
      goBackUrl={goBackUrl}
      isLoading={isLoading}
      defaultValues={getDuplicateFormValues(getFormValuesFromSku(sku))}
    />
  )
}

/**
 * Everything is copied but the identity: without `id` the form creates instead of
 * updating, and the code is left blank because it has to be unique.
 */
function getDuplicateFormValues({
  id: _id,
  ...formValues
}: SkuFormValues): Partial<SkuFormValues> {
  return {
    ...formValues,
    code: "",
    // the field is a required select: same fallback as a new SKU
    unitOfWeight:
      formValues.unitOfWeight !== "" ? formValues.unitOfWeight : "gr",
  }
}
