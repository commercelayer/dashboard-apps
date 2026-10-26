import {
  Alert,
  HookedInputRadioGroup,
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
 * the agreement's; shipping is its only address, or the one the seller picks
 * when the agreement has several. An agreement in another market blocks the
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
  const onlyShippingAddressId =
    result.kind === "linked" && result.shippingAddresses.length === 1
      ? result.shippingAddresses[0]?.address.id
      : undefined
  const otherMarket =
    result.kind === "other_market"
      ? (result.agreement.market?.name ?? "another market")
      : undefined

  useEffect(() => {
    setValue("agreement_id", agreementId)
    setValue("agreement_billing_address_id", billingAddressId)
    setValue("agreement_other_market", otherMarket)
    // a single address needs no choice; several wait for the seller's
    setValue("agreement_shipping_address_id", onlyShippingAddressId)
  }, [agreementId, billingAddressId, onlyShippingAddressId, otherMarket])

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
          {email} orders under the agreement {result.agreement.name}, in the{" "}
          {otherMarket} market. Start a new order in {otherMarket} to place it
          under the agreement.
        </Alert>
      </Spacer>
    )
  }

  const { agreement, shippingAddresses } = result

  return (
    <Spacer top="6">
      <Text tag="div" size="small">
        This order goes under the agreement{" "}
        <Text weight="semibold">{agreement.name}</Text>, with its billing
        address.
      </Text>
      {shippingAddresses.length === 1 && (
        <Spacer top="4">
          <ResourceAddress
            title="Ships to"
            address={shippingAddresses[0]?.address}
          />
        </Spacer>
      )}
      {shippingAddresses.length > 1 && (
        <Spacer top="4">
          <HookedInputRadioGroup
            name="agreement_shipping_address_id"
            title="Ships to"
            hint={{
              text: "The agreement has several delivery addresses: choose where this order ships.",
            }}
            viewMode="list"
            options={shippingAddresses.map(({ address, name, isDefault }) => ({
              value: address.id,
              content: (
                <>
                  <Text tag="div" weight="semibold" size="small">
                    {name ??
                      (isDefault
                        ? "Default shipping address"
                        : address.full_address)}
                  </Text>
                  <Text tag="div" size="small" variant="info">
                    {address.full_address}
                  </Text>
                </>
              ),
            }))}
          />
        </Spacer>
      )}
    </Spacer>
  )
}
