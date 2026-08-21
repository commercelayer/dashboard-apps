import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type {
  PriceFrequencyTierCreate,
  PriceVolumeTierCreate,
} from "@commercelayer/sdk"
import { useState } from "react"
import { Link, useLocation, useRoute } from "wouter"
import {
  PriceTierForm,
  type PriceTierFormValues,
} from "#components/PriceTierForm"
import { appRoutes } from "#data/routes"
import { usePriceDetails } from "#hooks/usePriceDetails"
import { getPriceTierSdkResource, getUpToFromForm } from "#utils/priceTiers"

export function PriceTierNew(): React.JSX.Element {
  const {
    canUser,
    settings: { mode },
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [location, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const tierType = location.includes("frequency") ? "frequency" : "volume"

  const pathName =
    tierType === "frequency" ? "priceFrequencyTierNew" : "priceVolumeTierNew"
  const sdkResource = getPriceTierSdkResource(tierType)

  const [, params] = useRoute<{ priceId: string }>(appRoutes[pathName].path)
  const priceId = params?.priceId ?? ""
  // the price list is no longer in the path: it comes from the price, which
  // `usePriceDetails` already includes
  const { price, isLoading, error } = usePriceDetails(priceId)
  const priceList = price?.price_list

  const pageTitle = "New tier"

  if (error != null) {
    return (
      <PageLayout
        title={pageTitle}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: pageTitle,
          icon: "arrowLeft",
        }}
        mode={mode}
      >
        <EmptyState
          title="Not authorized"
          action={
            <Link href={appRoutes.home.makePath({})}>
              <Button variant="primary">Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const goBackUrl = appRoutes.priceDetails.makePath({ priceId })

  if (!canUser("create", sdkResource)) {
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
      title={pageTitle}
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
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom="14">
          <PriceTierForm
            defaultValues={{
              currency_code: priceList?.currency_code,
              price: 0,
              type: tierType,
            }}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              const tier = adaptFormValuesToPriceTier(formValues, priceId)
              void sdkClient[sdkResource]
                .create(tier)
                .then(() => {
                  setLocation(
                    appRoutes.priceDetails.makePath({
                      priceId,
                    }),
                  )
                })
                .catch((error) => {
                  setApiError(error)
                  setIsSaving(false)
                })
            }}
          />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

function adaptFormValuesToPriceTier(
  formValues: PriceTierFormValues,
  priceId: string,
): PriceFrequencyTierCreate | PriceVolumeTierCreate {
  return {
    name: formValues.name,
    up_to: getUpToFromForm(formValues),
    price_amount_cents: formValues.price,
    price: {
      id: priceId,
      type: "prices",
    },
  }
}
