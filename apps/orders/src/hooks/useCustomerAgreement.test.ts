import type { Address, Agreement, AgreementAddress } from "@commercelayer/sdk"
import { getShippingOptions } from "./useCustomerAgreement"

function address(id: string): Address {
  return {
    type: "addresses",
    id,
    full_address: `${id} street`,
    created_at: "",
    updated_at: "",
  } as unknown as Address
}

function agreementAddress(id: string, name?: string): AgreementAddress {
  return {
    type: "agreement_addresses",
    id: `aa-${id}`,
    name,
    address: address(id),
    created_at: "",
    updated_at: "",
  }
}

function agreement(
  shipping: Address | null,
  delivery: AgreementAddress[] = [],
): Agreement {
  return {
    type: "agreements",
    id: "agreement",
    name: "Brand Supply — US wholesale",
    shipping_address: shipping,
    agreement_addresses: delivery,
    created_at: "",
    updated_at: "",
  }
}

describe("getShippingOptions", () => {
  it("offers the default shipping address alone when there is nothing else", () => {
    const options = getShippingOptions(agreement(address("hq")))
    expect(options).toHaveLength(1)
    expect(options[0]).toMatchObject({ isDefault: true })
    expect(options[0]?.address.id).toBe("hq")
  })

  it("lists the default first, then the named delivery addresses", () => {
    const options = getShippingOptions(
      agreement(address("hq"), [
        agreementAddress("warehouse", "North warehouse"),
        agreementAddress("store", "Main store"),
      ]),
    )
    expect(options.map(({ address }) => address.id)).toEqual([
      "hq",
      "warehouse",
      "store",
    ])
    expect(options.map(({ name }) => name)).toEqual([
      undefined,
      "North warehouse",
      "Main store",
    ])
  })

  it("counts a place once when the default is also a named address", () => {
    const options = getShippingOptions(
      agreement(address("hq"), [
        agreementAddress("hq", "Head office"),
        agreementAddress("store", "Main store"),
      ]),
    )
    expect(options).toHaveLength(2)
    expect(options[0]).toMatchObject({ isDefault: true, name: "Head office" })
  })

  it("has a single choice when the only address is a named one", () => {
    const options = getShippingOptions(
      agreement(null, [agreementAddress("store", "Main store")]),
    )
    expect(options).toHaveLength(1)
    expect(options[0]).toMatchObject({ isDefault: false, name: "Main store" })
  })
})
