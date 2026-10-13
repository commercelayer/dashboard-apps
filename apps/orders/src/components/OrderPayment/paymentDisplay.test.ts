import type { PaymentSession, PaymentWallet } from "@commercelayer/sdk"
import {
  getPaymentSessionDisplay,
  getPaymentSettingDisplay,
  getPaymentWalletDisplay,
  type PaymentSettingType,
} from "dashboard-apps-common/src/helpers/paymentDisplay"
import { describe, expect, test } from "vitest"

/**
 * Only what `getPaymentSessionDisplay` reads: the payment setting type, the
 * authorization's `response_data`, and the gift card code.
 */
function makeSession({
  settingType,
  responseData,
  giftCardCode,
}: {
  settingType?: string
  responseData?: Record<string, unknown>
  giftCardCode?: string
}): PaymentSession {
  return {
    gift_card_code: giftCardCode,
    payment_setting: settingType != null ? { type: settingType } : undefined,
    payment_authorization:
      responseData != null ? { response_data: responseData } : undefined,
  } as unknown as PaymentSession
}

describe("getPaymentSessionDisplay > Adyen", () => {
  test("resolves a plain card brand", () => {
    const { logoSrc, label, last4 } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_setting_adyens",
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
    const { logoSrc, label } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_setting_adyens",
        responseData: { paymentMethod: "mc" },
      }),
    )

    expect(logoSrc).toContain("/mastercard.svg")
    expect(label).toBe("Mastercard")
  })

  test("splits a composite wallet code, showing the wallet logo and the card brand", () => {
    // Real payload: a Mastercard paid through Apple Pay.
    const { logoSrc, label, last4 } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_setting_adyens",
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
    const { logoSrc, label } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_setting_adyens",
        responseData: { paymentMethod: "googlepay" },
      }),
    )

    expect(logoSrc).toContain("/google_pay.svg")
    expect(label).toBe("Google Pay")
  })

  test("accepts its older Google Pay spelling", () => {
    expect(
      getPaymentSessionDisplay(
        makeSession({
          settingType: "payment_setting_adyens",
          responseData: { paymentMethod: "paywithgoogle" },
        }),
      ).logoSrc,
    ).toContain("/google_pay.svg")
  })

  test("falls back to the payment setting when the response carries no card data", () => {
    // Real payload: Adyen rejected the authorization with a validation error,
    // so there is no brand and no last4 anywhere.
    const { logoSrc, label, last4 } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_setting_adyens",
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

describe("getPaymentSessionDisplay > Stripe", () => {
  test("reads the brand and last4 from the charge", () => {
    const { logoSrc, label, last4 } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_setting_stripes",
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
    const { logoSrc, label } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_setting_stripes",
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

describe("getPaymentSessionDisplay > without card details", () => {
  test("shows the gift card tail, truncated like a PAN", () => {
    const { logoSrc, label, last4 } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_setting_gift_cards",
        giftCardCode: "3XLTDGGVYE",
      }),
    )

    expect(logoSrc).toContain("/giftcard.svg")
    expect(label).toBe("Gift Card")
    expect(last4).toBe("GVYE")
  })

  test("degrades to a generic icon without a payment setting", () => {
    const { logoSrc, label } = getPaymentSessionDisplay(makeSession({}))

    expect(logoSrc).toContain("/credit-card.svg")
    expect(label).toBe("Payment")
  })
})

describe("getPaymentSessionDisplay > base payment setting type", () => {
  test("ignores `payment_settings`, which names no gateway", () => {
    // The API can return the base type instead of the STI one.
    const { logoSrc, label } = getPaymentSessionDisplay(
      makeSession({
        settingType: "payment_settings",
        responseData: { paymentMethod: "visa" },
      }),
    )

    expect(logoSrc).toContain("/credit-card.svg")
    expect(label).toBe("Payment")
  })
})

describe("getPaymentSettingDisplay", () => {
  test("resolves a known payment setting", () => {
    const { logoSrc, label } = getPaymentSettingDisplay(
      "payment_setting_checkout_coms",
    )

    expect(logoSrc).toContain("/checkout_com.svg")
    expect(label).toBe("Checkout.com")
  })

  test("leaves the label undefined when there is no payment setting", () => {
    const { logoSrc, label } = getPaymentSettingDisplay(undefined)

    expect(logoSrc).toContain("/credit-card.svg")
    expect(label).toBeUndefined()
  })

  test("treats the base `payment_settings` type as unknown", () => {
    // Typed as a payment setting type by the SDK, returned by the API anyway.
    const { label } = getPaymentSettingDisplay(
      "payment_settings" as PaymentSettingType,
    )

    expect(label).toBeUndefined()
  })
})

/** Only what `getPaymentWalletDisplay` reads. */
function makeWallet({
  settingType,
  paymentData,
}: {
  settingType?: string
  paymentData?: Record<string, unknown>
}): PaymentWallet {
  return {
    payment_setting: settingType != null ? { type: settingType } : undefined,
    payment_data: paymentData,
  } as unknown as PaymentWallet
}

describe("getPaymentWalletDisplay", () => {
  // Wallets come back with the base setting type, so the shape names it.
  const settingType = "payment_settings"

  test("reads a Stripe PaymentMethod", () => {
    const { logoSrc, label, last4, settingLabel } = getPaymentWalletDisplay(
      makeWallet({
        settingType,
        paymentData: {
          object: "payment_method",
          type: "card",
          card: { brand: "visa", last4: "4242", wallet: { type: "apple_pay" } },
        },
      }),
    )

    expect(logoSrc).toContain("/apple_pay.svg")
    expect(label).toBe("Visa")
    expect(last4).toBe("4242")
    expect(settingLabel).toBe("Stripe")
  })

  test("reads an Adyen stored payment method", () => {
    const { logoSrc, label, last4, settingLabel } = getPaymentWalletDisplay(
      makeWallet({
        settingType,
        paymentData: { brand: "mc", lastFour: "1113" },
      }),
    )

    expect(logoSrc).toContain("/mastercard.svg")
    expect(label).toBe("Mastercard")
    expect(last4).toBe("1113")
    expect(settingLabel).toBe("Adyen")
  })

  test("reads an Adyen recurring contract notification", () => {
    const { label, last4, settingLabel } = getPaymentWalletDisplay(
      makeWallet({
        settingType,
        paymentData: {
          paymentMethod: "visa",
          additionalData: { cardSummary: "0005" },
        },
      }),
    )

    expect(label).toBe("Visa")
    expect(last4).toBe("0005")
    expect(settingLabel).toBe("Adyen")
  })

  test("reads a Braintree vaulted card", () => {
    const { label, last4, settingLabel } = getPaymentWalletDisplay(
      makeWallet({
        settingType,
        paymentData: { brand_code: "visa", last4: "1881" },
      }),
    )

    expect(label).toBe("Visa")
    expect(last4).toBe("1881")
    expect(settingLabel).toBe("Braintree")
  })

  test("prefers the setting's own type when it names one", () => {
    const { label, settingLabel } = getPaymentWalletDisplay(
      makeWallet({ settingType: "payment_setting_adyens", paymentData: {} }),
    )

    expect(label).toBe("Adyen")
    expect(settingLabel).toBe("Adyen")
  })

  test("degrades to a generic icon for an unrecognized payload", () => {
    const { logoSrc, label, settingLabel } = getPaymentWalletDisplay(
      makeWallet({ settingType, paymentData: { unexpected: true } }),
    )

    expect(logoSrc).toContain("/credit-card.svg")
    expect(label).toBe("Payment")
    expect(settingLabel).toBeUndefined()
  })
})
