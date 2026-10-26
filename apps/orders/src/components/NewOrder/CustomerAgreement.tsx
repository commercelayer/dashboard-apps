import {
  Alert,
  HookedInputSelect,
  ResourceAddress,
  SkeletonTemplate,
  Spacer,
  Text,
} from "@commercelayer/app-elements"
import type { Market } from "@commercelayer/sdk"
import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useCustomerAgreement } from "#hooks/useCustomerAgreement"

/** The form fields this block fills in for the submit to send to Core. */
export interface CustomerAgreementFields {
  agreement_id?: string
  agreement_billing_address_id?: string
  agreement_shipping_address_id?: string
  /** Set when the customer's agreement is in another market: blocks the submit. */
  agreement_other_market?: string
}

/**
 * B2B: what picking this customer means for the order.
 *
 * A customer who orders under an active agreement in this market gets the
 * order linked to it, always — there is no option to leave it out. Billing is
 * the agreement's; shipping starts on the agreement's default shipping address,
 * and the seller picks another one when the agreement has several — a select,
 * searchable, since a chain may hold one per store. An agreement in another market blocks the
 * order instead: prices and stock follow the market, so the seller starts again
 * in the agreement's.
 *
 * Core copies an agreement's addresses only when an order is created with it,
 * and this order exists since the market was picked, so the submit sets them.
 */
export function CustomerAgreement({
  market,
}: {
  market: Market | null | undefined
}): React.JSX.Element | null {
  const { watch, setValue } = useFormContext<
    CustomerAgreementFields & { customer_email?: string }
  >()
  const email = watch("customer_email")
  const { isLoading, result } = useCustomerAgreement(email, market)

  const agreementId = result.kind === "linked" ? result.agreement.id : undefined
  const billingAddressId =
    result.kind === "linked" ? result.agreement.billing_address?.id : undefined
  const defaultShippingAddressId =
    result.kind === "linked"
      ? (
          result.shippingAddresses.find(({ isDefault }) => isDefault) ??
          result.shippingAddresses[0]
        )?.address.id
      : undefined
  const otherMarket =
    result.kind === "other_market"
      ? (result.agreement.market?.name ?? "another market")
      : undefined

  useEffect(() => {
    setValue("agreement_id", agreementId)
    setValue("agreement_billing_address_id", billingAddressId)
    setValue("agreement_other_market", otherMarket)
    // where an order under the agreement ships unless the seller says otherwise
    setValue("agreement_shipping_address_id", defaultShippingAddressId)
  }, [agreementId, billingAddressId, defaultShippingAddressId, otherMarket])

  if (isLoading) {
    return (
      <Spacer top="6">
        <SkeletonTemplate isLoading delayMs={0}>
          <Text>Looking for an agreement…</Text>
        </SkeletonTemplate>
      </Spacer>
    )
  }

  if (result.kind === "none") {
    return null
  }

  if (result.kind === "other_market") {
    return (
      <Spacer top="6">
        <Alert status="warning">
          Agreement in <Text weight="semibold">{otherMarket}</Text>. Start the
          order in that market.
        </Alert>
      </Spacer>
    )
  }

  const { agreement, shippingAddresses } = result

  return (
    <Spacer top="6">
      <Text tag="div" size="small">
        <Text weight="semibold">Agreement:</Text> {agreement.name}
      </Text>
      {shippingAddresses.length > 1 ? (
        <Spacer top="4">
          <HookedInputSelect
            name="agreement_shipping_address_id"
            label="Ships to"
            isSearchable
            initialValues={shippingAddresses.map(
              ({ address, name, isDefault }) => ({
                value: address.id,
                label: shippingLabel({ address, name, isDefault }),
              }),
            )}
          />
        </Spacer>
      ) : (
        // one address leaves nothing to pick, so the address is what to show
        <Spacer top="4">
          <ResourceAddress
            title="Ships to"
            address={shippingAddresses[0]?.address}
          />
        </Spacer>
      )}
    </Spacer>
  )
}

/** An address's name for the place, then the address — each said once. */
function shippingLabel({
  address,
  name,
  isDefault,
}: {
  address: { full_address?: string | null }
  name?: string
  isDefault: boolean
}): string {
  const title = name ?? (isDefault ? "Default shipping address" : undefined)
  return title == null
    ? (address.full_address ?? "")
    : `${title} — ${address.full_address ?? ""}`
}
