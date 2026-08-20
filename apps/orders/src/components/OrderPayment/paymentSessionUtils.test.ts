import type { Order, PaymentLink, PaymentSession } from "@commercelayer/sdk"
import { describe, expect, test } from "vitest"
import {
  canCapture,
  getCaptureDistribution,
  getOrderPaymentTotals,
  getUnrequestedAmountCents,
} from "#components/OrderPayment/paymentSessionUtils"

const recently = new Date().toISOString()
const longAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

type Transaction = {
  status: string
  amount_cents?: number
  created_at?: string
}

/** Only what the helpers read. */
function makeSession({
  id = "session",
  status = "authorized",
  captureBalanceCents = 0,
  captures = [],
  refunds = [],
  transactions = [],
}: {
  id?: string
  status?: PaymentSession["status"]
  captureBalanceCents?: number
  captures?: Transaction[]
  refunds?: Transaction[]
  transactions?: Transaction[]
}): PaymentSession {
  const withDate = (list: Transaction[]) =>
    list.map((item) => ({ created_at: recently, ...item }))

  return {
    id,
    status,
    payment_authorization: { capture_balance_cents: captureBalanceCents },
    payment_captures: withDate(captures),
    payment_refunds: withDate(refunds),
    payment_transactions: withDate(transactions),
  } as unknown as PaymentSession
}

function makeOrder(totalCents: number, sessions: PaymentSession[]): Order {
  return {
    total_amount_with_taxes_cents: totalCents,
    payment_sessions: sessions,
  } as unknown as Order
}

function makeLink(status: PaymentLink["status"], amountCents: number) {
  return { status, amount_cents: amountCents } as unknown as PaymentLink
}

describe("getOrderPaymentTotals", () => {
  test("a fully captured order owes nothing", () => {
    const totals = getOrderPaymentTotals(
      makeOrder(7100, [
        makeSession({
          status: "paid",
          captures: [{ status: "succeeded", amount_cents: 7100 }],
        }),
      ]),
    )

    expect(totals).toMatchObject({
      paidCents: 7100,
      toCollectCents: 0,
      toRefundCents: 0,
    })
  })

  test("an order edited down after capture owes a refund", () => {
    const totals = getOrderPaymentTotals(
      makeOrder(7100, [
        makeSession({
          status: "paid",
          captures: [{ status: "succeeded", amount_cents: 10000 }],
        }),
      ]),
    )

    expect(totals.toRefundCents).toBe(2900)
    expect(totals.toCollectCents).toBe(0)
  })

  test("refunding too much leaves an amount to collect", () => {
    const totals = getOrderPaymentTotals(
      makeOrder(3790, [
        makeSession({
          status: "partially_refunded",
          captures: [{ status: "succeeded", amount_cents: 7100 }],
          refunds: [{ status: "succeeded", amount_cents: 3500 }],
        }),
      ]),
    )

    expect(totals).toMatchObject({
      capturedCents: 7100,
      refundedCents: 3500,
      paidCents: 3600,
      toCollectCents: 190,
    })
  })

  test("a hold covers what is missing, and only that", () => {
    const totals = getOrderPaymentTotals(
      makeOrder(14000, [
        makeSession({
          status: "paid",
          captures: [{ status: "succeeded", amount_cents: 11000 }],
        }),
        makeSession({ status: "authorized", captureBalanceCents: 3400 }),
        makeSession({ status: "authorized", captureBalanceCents: 6500 }),
      ]),
    )

    expect(totals.heldCents).toBe(9900)
    expect(totals.toCollectCents).toBe(0)
    expect(totals.toRefundCents).toBe(0)
  })

  test("ignores a voided session's balance and failed transactions", () => {
    const totals = getOrderPaymentTotals(
      makeOrder(6900, [
        makeSession({ status: "voided", captureBalanceCents: 6900 }),
        makeSession({
          status: "authorized",
          captures: [{ status: "failed", amount_cents: 6900 }],
        }),
      ]),
    )

    expect(totals.heldCents).toBe(0)
    expect(totals.capturedCents).toBe(0)
    expect(totals.toCollectCents).toBe(6900)
  })
})

describe("getCaptureDistribution", () => {
  test("takes the oldest session first, up to what the order needs", () => {
    const first = makeSession({ id: "first", captureBalanceCents: 3400 })
    const second = makeSession({ id: "second", captureBalanceCents: 6500 })

    const distribution = getCaptureDistribution(
      makeOrder(3000, [first, second]),
    )

    expect(distribution).toEqual([{ session: first, amountCents: 3000 }])
  })

  test("takes every balance in full when the order needs it all", () => {
    const first = makeSession({ id: "first", captureBalanceCents: 3400 })
    const second = makeSession({ id: "second", captureBalanceCents: 6500 })

    expect(getCaptureDistribution(makeOrder(20000, [first, second]))).toEqual([
      { session: first, amountCents: 3400 },
      { session: second, amountCents: 6500 },
    ])
  })

  test("skips sessions that cannot be captured", () => {
    const voided = makeSession({ status: "voided", captureBalanceCents: 3400 })
    const busy = makeSession({
      captureBalanceCents: 6500,
      transactions: [{ status: "pending" }],
    })

    expect(getCaptureDistribution(makeOrder(20000, [voided, busy]))).toEqual([])
  })
})

describe("getUnrequestedAmountCents", () => {
  const order = makeOrder(6900, [])

  test("subtracts what open links ask for, ignoring expired ones", () => {
    expect(
      getUnrequestedAmountCents(order, [
        makeLink("open", 4000),
        makeLink("expired", 6900),
      ]),
    ).toBe(2900)
  })

  test("is zero once open links cover the gap", () => {
    expect(
      getUnrequestedAmountCents(order, [
        makeLink("open", 4000),
        makeLink("open", 4000),
      ]),
    ).toBe(0)
  })
})

describe("canCapture", () => {
  test("waits for a recent transaction", () => {
    expect(
      canCapture(
        makeSession({
          captureBalanceCents: 7100,
          transactions: [{ status: "pending", created_at: recently }],
        }),
      ),
    ).toBe(false)
  })

  test("is not blocked forever by a stuck transaction", () => {
    expect(
      canCapture(
        makeSession({
          captureBalanceCents: 7100,
          transactions: [{ status: "pending", created_at: longAgo }],
        }),
      ),
    ).toBe(true)
  })

  test("still captures a remainder after a partial refund", () => {
    expect(
      canCapture(
        makeSession({
          status: "partially_refunded",
          captureBalanceCents: 1500,
        }),
      ),
    ).toBe(true)
  })
})
