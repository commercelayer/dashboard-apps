import type { PaymentSession } from "@commercelayer/sdk"
import { describe, expect, test } from "vitest"
import { getPaymentDisplay } from "./paymentDisplay"

/**
 * Only the three things `getPaymentDisplay` reads: the gateway type, the
 * authorization's verbatim `response_data`, and the gift card code.
 */
function makeSession({
  gateway,
  responseData,
  giftCardCode,
}: {
  gateway?: string
  responseData?: Record<string, unknown>
  giftCardCode?: string
}): PaymentSession {
  return {
    gift_card_code: giftCardCode,
    payment_setting: gateway != null ? { type: gateway } : undefined,
    payment_authorization:
      responseData != null ? { response_data: responseData } : undefined,
  } as unknown as PaymentSession
}

describe("getPaymentDisplay > Adyen", () => {
  test("resolves a plain card brand", () => {
    const { logoSrc, label, last4 } = getPaymentDisplay(
      makeSession({
        gateway: "payment_setting_adyens",
        responseData: {
          paymentMethod: "visa",
          additionalData: { cardSummary: "1111" },
        },
      }),
    )

    expect(logoSrc).toContain("/visa.svg")
    expect(label).toBe("Visa")
    expect(last4).toBe("1111")
  })

  test("maps its `mc` shorthand to the readable asset name", () => {
    const { logoSrc, label } = getPaymentDisplay(
      makeSession({
        gateway: "payment_setting_adyens",
        responseData: { paymentMethod: "mc" },
      }),
    )

    expect(logoSrc).toContain("/mastercard.svg")
    expect(label).toBe("Mastercard")
  })

  test("splits a composite wallet code, showing the wallet logo and the card brand", () => {
    // Real payload: a Mastercard paid through Apple Pay.
    const { logoSrc, label, last4 } = getPaymentDisplay(
      makeSession({
        gateway: "payment_setting_adyens",
        responseData: {
          paymentMethod: "mc_applepay",
          additionalData: { cardSummary: "4318" },
        },
      }),
    )

    expect(logoSrc).toContain("/apple_pay.svg")
    expect(label).toBe("Mastercard")
    expect(last4).toBe("4318")
  })

  test("labels a wallet-only code with the wallet", () => {
    const { logoSrc, label } = getPaymentDisplay(
      makeSession({
        gateway: "payment_setting_adyens",
        responseData: { paymentMethod: "googlepay" },
      }),
    )

    expect(logoSrc).toContain("/google_pay.svg")
    expect(label).toBe("Google Pay")
  })

  test("accepts its older Google Pay spelling", () => {
    expect(
      getPaymentDisplay(
        makeSession({
          gateway: "payment_setting_adyens",
          responseData: { paymentMethod: "paywithgoogle" },
        }),
      ).logoSrc,
    ).toContain("/google_pay.svg")
  })

  test("falls back to the gateway when the response carries no card data", () => {
    // Real payload: Adyen rejected the authorization with a validation error,
    // so there is no brand and no last4 anywhere.
    const { logoSrc, label, last4 } = getPaymentDisplay(
      makeSession({
        gateway: "payment_setting_adyens",
        responseData: {
          status: 422,
          message: "Required object 'paymentMethod' is not provided.",
          errorCode: "14_006",
        },
      }),
    )

    expect(logoSrc).toContain("/adyen.svg")
    expect(label).toBe("Adyen")
    expect(last4).toBeUndefined()
  })
})

describe("getPaymentDisplay > Stripe", () => {
  test("reads the brand and last4 from the charge", () => {
    const { logoSrc, label, last4 } = getPaymentDisplay(
      makeSession({
        gateway: "payment_setting_stripes",
        responseData: {
          payment_method_details: {
            card: { brand: "visa", last4: "4242", wallet: null },
          },
        },
      }),
    )

    expect(logoSrc).toContain("/visa.svg")
    expect(label).toBe("Visa")
    expect(last4).toBe("4242")
  })

  test("prefers the wallet logo when the card was tokenized through one", () => {
    const { logoSrc, label } = getPaymentDisplay(
      makeSession({
        gateway: "payment_setting_stripes",
        responseData: {
          payment_method_details: {
            card: {
              brand: "visa",
              last4: "4242",
              wallet: { type: "apple_pay" },
            },
          },
        },
      }),
    )

    expect(logoSrc).toContain("/apple_pay.svg")
    expect(label).toBe("Visa")
  })
})

describe("getPaymentDisplay > without card details", () => {
  test("shows the gift card tail, truncated like a PAN", () => {
    const { logoSrc, label, last4 } = getPaymentDisplay(
      makeSession({
        gateway: "payment_setting_gift_cards",
        giftCardCode: "3XLTDGGVYE",
      }),
    )

    expect(logoSrc).toContain("/giftcard.svg")
    expect(label).toBe("Gift Card")
    expect(last4).toBe("GVYE")
  })

  test("degrades to a generic icon for an unknown gateway", () => {
    const { logoSrc, label } = getPaymentDisplay(makeSession({}))

    expect(logoSrc).toContain("/credit-card.svg")
    expect(label).toBe("Payment")
  })
})
