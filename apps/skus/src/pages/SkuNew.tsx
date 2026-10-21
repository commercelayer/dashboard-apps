import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { SkuCreate } from "@commercelayer/sdk"
import { useState } from "react"
import { Link, useLocation } from "wouter"
import {
  isValidUnitOfWeight,
  SkuForm,
  type SkuFormValues,
} from "#components/SkuForm"
import { appRoutes } from "#data/routes"

export function SkuNew(): React.JSX.Element {
  return (
    <SkuCreatePage
      goBackUrl={appRoutes.list.makePath({})}
      defaultValues={{
        unitOfWeight: "gr",
      }}
    />
  )
}

interface SkuCreatePageProps {
  /** Where both `Cancel` and the permission-denied fallback lead. */
  goBackUrl: string
  /** While `true` the form is not rendered, since it reads its values only once. */
  isLoading?: boolean
  defaultValues: Partial<SkuFormValues>
}

/**
 * The create overlay, shared by "New SKU" and "Duplicate", which differ only in
 * the values the form starts from and in where `Cancel` leads.
 */
export function SkuCreatePage({
  goBackUrl,
  isLoading = false,
  defaultValues,
}: SkuCreatePageProps): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()

  if (!canUser("create", "skus")) {
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
      title={<SkeletonTemplate isLoading={isLoading}>New SKU</SkeletonTemplate>}
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
        {isLoading ? null : (
          <SkuForm
            defaultValues={defaultValues}
            apiError={apiError}
            onSubmit={(formValues) => {
              const sku = adaptFormValuesToSku(formValues)
              void sdkClient.skus
                .create(sku)
                .then((createdSku) => {
                  setLocation(
                    appRoutes.details.makePath({ skuId: createdSku.id }),
                  )
                })
                .catch((error) => {
                  setApiError(error)
                })
            }}
          />
        )}
      </Spacer>
    </PageLayout>
  )
}

function adaptFormValuesToSku(formValues: SkuFormValues): SkuCreate {
  /*
   * Note: `unit of weight` field will be sent as `undefined` if the `weight` field is not a positive number
   */
  const refinedUnitOfWeight =
    parseInt(formValues.weight ?? "") > 0 &&
    formValues.unitOfWeight != null &&
    formValues.unitOfWeight?.length > 0 &&
    isValidUnitOfWeight(formValues.unitOfWeight)
      ? formValues.unitOfWeight
      : undefined

  return {
    code: formValues.code,
    name: formValues.name,
    description: formValues.description,
    image_url: formValues.imageUrl,
    shipping_category: {
      id: formValues.shippingCategory ?? null,
      type: "shipping_categories",
    },
    weight: parseInt(formValues.weight ?? ""),
    unit_of_weight: refinedUnitOfWeight,
    pieces_per_pack: formValues.piecesPerPack ?? null,
    hs_tariff_number: formValues.hsTariffNumber,
    do_not_ship: formValues.doNotShip,
    do_not_track: formValues.doNotTrack,
  }
}
