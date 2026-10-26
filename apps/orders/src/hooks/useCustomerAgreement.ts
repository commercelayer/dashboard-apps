import { useCoreApi, useTokenProvider } from "@commercelayer/app-elements"
import type { Address, Agreement, Market } from "@commercelayer/sdk"

export type CustomerAgreement =
  /** Agreements off, no email yet, or this customer holds no active agreement. */
  | { kind: "none" }
  /** An agreement in the order's market: the order goes under it. */
  | {
      kind: "linked"
      agreement: Agreement
      shippingAddresses: ShippingOption[]
    }
  /** An agreement in another market: the order cannot go under it from here. */
  | { kind: "other_market"; agreement: Agreement }

export interface ShippingOption {
  address: Address
  /** The agreement's own name for the place, when it has one. */
  name?: string
  isDefault: boolean
}

/**
 * The agreement an order for this customer goes under, if any.
 *
 * Found through the customer's agreement identity rather than the email: the
 * identity is what Core checks when the order is placed (an enabled one, on the
 * order's customer), and in Phase 2 colleagues get their own customers under
 * the same agreement.
 *
 * A seller organization has at most one agreement per buyer customer, so the
 * first active one is the answer; an inactive, expired or cancelled agreement,
 * or a disabled identity, counts as none — an order under it could not be placed.
 */
export function useCustomerAgreement(
  email: string | undefined,
  market: Pick<Market, "id"> | null | undefined,
): { isLoading: boolean; result: CustomerAgreement } {
  const {
    settings: { extras },
  } = useTokenProvider()
  const isEnabled = extras?.organization?.isAgreementsEnabled === true
  const isEmail = email != null && /^[^\s@]+@[^\s@]+$/.test(email)

  const { data: customers, isLoading: isLoadingCustomer } = useCoreApi(
    "customers",
    "list",
    isEnabled && isEmail
      ? [{ filters: { email_eq: email }, fields: ["id"], pageSize: 1 }]
      : null,
  )
  const customerId = customers?.[0]?.id

  const { data: identities, isLoading: isLoadingIdentities } = useCoreApi(
    "agreement_identities",
    "list",
    customerId != null
      ? [
          {
            filters: { customer_id_eq: customerId, disabled_at_null: true },
            include: [
              "agreement",
              "agreement.market",
              "agreement.billing_address",
              "agreement.shipping_address",
              "agreement.agreement_addresses",
              "agreement.agreement_addresses.address",
            ],
            pageSize: 25,
          },
        ]
      : null,
  )

  const agreement = identities
    ?.map((identity) => identity.agreement)
    .find((candidate) => candidate?.status === "active")

  if (agreement == null) {
    return {
      isLoading: isLoadingCustomer || isLoadingIdentities,
      result: { kind: "none" },
    }
  }

  if (market == null || agreement.market?.id !== market.id) {
    return { isLoading: false, result: { kind: "other_market", agreement } }
  }

  return {
    isLoading: false,
    result: {
      kind: "linked",
      agreement,
      shippingAddresses: getShippingOptions(agreement),
    },
  }
}

/**
 * Where an order under the agreement can ship: its default shipping address,
 * then its named delivery addresses, each place once — the default is often one
 * of the named ones too.
 */
export function getShippingOptions(agreement: Agreement): ShippingOption[] {
  const options: ShippingOption[] = []
  const add = (option: ShippingOption): void => {
    const existing = options.find(
      ({ address }) => address.id === option.address.id,
    )
    if (existing == null) {
      options.push(option)
    } else {
      existing.name ??= option.name
    }
  }

  if (agreement.shipping_address != null) {
    add({ address: agreement.shipping_address, isDefault: true })
  }
  for (const agreementAddress of agreement.agreement_addresses ?? []) {
    if (agreementAddress.address != null) {
      add({
        address: agreementAddress.address,
        name: agreementAddress.name ?? undefined,
        isDefault: false,
      })
    }
  }

  return options
}
