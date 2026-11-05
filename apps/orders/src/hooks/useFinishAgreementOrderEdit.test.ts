import type { CommerceLayerClient, Order } from "@commercelayer/sdk"
import { finishAgreementOrderEdit } from "./useFinishAgreementOrderEdit"

vi.mock("#hooks/useOrderDetails", () => ({
  orderIncludeAttribute: [],
  useOrderDetails: () => ({ mutateOrder: vi.fn() }),
}))

const sdkClient = {
  orders: {
    update: vi.fn(),
    retrieve: vi.fn(),
    relationship: (id: string) => ({ id, type: "orders" }),
  },
  payment_sessions: {
    create: vi.fn(),
    relationship: (id: string) => ({ id, type: "payment_sessions" }),
  },
  payment_setting_manuals: {
    relationship: (id: string) => ({ id, type: "payment_setting_manuals" }),
  },
  payment_authorizations: { create: vi.fn(), retrieve: vi.fn() },
}

const finish = async (): Promise<Order> =>
  await finishAgreementOrderEdit(
    sdkClient as unknown as CommerceLayerClient,
    "order1",
    // no waiting between polls in tests
    { pollIntervalMs: 0 },
  )

/** The order as Core returns it, with its totals and payment sessions. */
function orderWithPayments({
  totalCents,
  sessions,
}: {
  totalCents: number
  sessions: Array<{
    id: string
    status: string
    heldCents?: number
    authorization?: { id: string; status: string }
  }>
}): Order {
  return {
    id: "order1",
    status: "editing",
    total_amount_with_taxes_cents: totalCents,
    market: { name: "USA wholesale" },
    available_payment_settings: [
      { id: "manual1", type: "payment_setting_manuals" },
    ],
    payment_sessions: sessions.map(
      ({ id, status, heldCents, authorization }) => ({
        id,
        status,
        payment_authorization:
          authorization ??
          (heldCents != null ? { capture_balance_cents: heldCents } : null),
        payment_captures: [],
        payment_refunds: [],
      }),
    ),
  } as unknown as Order
}

const stopEditingCalls = (): unknown[][] =>
  sdkClient.orders.update.mock.calls.filter(
    ([body]) => (body as { _stop_editing?: boolean })._stop_editing === true,
  )

beforeEach(() => {
  vi.clearAllMocks()
  sdkClient.orders.update.mockImplementation(async (body: object) => body)
  sdkClient.payment_sessions.create.mockResolvedValue({
    id: "topup1",
    status: "unpaid",
  })
  sdkClient.payment_authorizations.create.mockResolvedValue({
    id: "auth2",
    status: "succeeded",
  })
})

describe("finishAgreementOrderEdit", () => {
  test("authorizes what the edit added on a second manual session, then finishes", async () => {
    sdkClient.orders.retrieve.mockResolvedValue(
      orderWithPayments({
        totalCents: 2400,
        sessions: [{ id: "session1", status: "authorized", heldCents: 1200 }],
      }),
    )

    await finish()

    // the edit is only stopped once the difference is authorized
    expect(sdkClient.orders.update).toHaveBeenCalledTimes(1)
    expect(sdkClient.payment_sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_setting: { id: "manual1", type: "payment_setting_manuals" },
        amount_cents: 1200,
      }),
    )
    expect(sdkClient.payment_authorizations.create).toHaveBeenCalledWith({
      payment_session: { id: "topup1", type: "payment_sessions" },
    })
    expect(stopEditingCalls()).toHaveLength(1)
  })

  test("only finishes when what was authorized still covers the order", async () => {
    sdkClient.orders.retrieve.mockResolvedValue(
      orderWithPayments({
        totalCents: 1000,
        sessions: [{ id: "session1", status: "authorized", heldCents: 1200 }],
      }),
    )

    await finish()

    expect(sdkClient.payment_sessions.create).not.toHaveBeenCalled()
    expect(sdkClient.payment_authorizations.create).not.toHaveBeenCalled()
    expect(stopEditingCalls()).toHaveLength(1)
  })

  test("waits for a pending authorization to succeed before finishing", async () => {
    sdkClient.orders.retrieve.mockResolvedValue(
      orderWithPayments({
        totalCents: 2400,
        sessions: [{ id: "session1", status: "authorized", heldCents: 1200 }],
      }),
    )
    sdkClient.payment_authorizations.create.mockResolvedValue({
      id: "auth2",
      status: "pending",
    })
    sdkClient.payment_authorizations.retrieve
      .mockResolvedValueOnce({ id: "auth2", status: "processing" })
      .mockResolvedValueOnce({ id: "auth2", status: "succeeded" })

    await finish()

    expect(sdkClient.payment_authorizations.retrieve).toHaveBeenCalledTimes(2)
    expect(stopEditingCalls()).toHaveLength(1)
  })

  test("on a retry, waits on the authorization an earlier attempt started", async () => {
    sdkClient.orders.retrieve.mockResolvedValue(
      orderWithPayments({
        totalCents: 2400,
        sessions: [
          { id: "session1", status: "authorized", heldCents: 1200 },
          {
            id: "topup1",
            status: "unpaid",
            authorization: { id: "auth2", status: "pending" },
          },
        ],
      }),
    )
    sdkClient.payment_authorizations.retrieve.mockResolvedValue({
      id: "auth2",
      status: "succeeded",
    })

    await finish()

    expect(sdkClient.payment_sessions.create).not.toHaveBeenCalled()
    expect(sdkClient.payment_authorizations.create).not.toHaveBeenCalled()
    expect(stopEditingCalls()).toHaveLength(1)
  })

  test("does not finish when the authorization is declined", async () => {
    sdkClient.orders.retrieve.mockResolvedValue(
      orderWithPayments({
        totalCents: 2400,
        sessions: [{ id: "session1", status: "authorized", heldCents: 1200 }],
      }),
    )
    sdkClient.payment_authorizations.create.mockResolvedValue({
      id: "auth2",
      status: "declined",
    })

    await expect(finish()).rejects.toThrow(
      "The payment authorization is declined.",
    )
    expect(stopEditingCalls()).toHaveLength(0)
  })

  test("on a retry, authorizes the session an earlier attempt left unpaid", async () => {
    sdkClient.orders.retrieve.mockResolvedValue(
      orderWithPayments({
        totalCents: 2400,
        sessions: [
          { id: "session1", status: "authorized", heldCents: 1200 },
          { id: "topup1", status: "unpaid" },
        ],
      }),
    )

    await finish()

    expect(sdkClient.payment_sessions.create).not.toHaveBeenCalled()
    expect(sdkClient.payment_authorizations.create).toHaveBeenCalledWith({
      payment_session: { id: "topup1", type: "payment_sessions" },
    })
  })

  test("does not finish when Core refuses the authorization", async () => {
    sdkClient.orders.retrieve.mockResolvedValue(
      orderWithPayments({
        totalCents: 2400,
        sessions: [{ id: "session1", status: "authorized", heldCents: 1200 }],
      }),
    )
    sdkClient.payment_authorizations.create.mockRejectedValue(
      new Error("The authorization was declined."),
    )

    await expect(finish()).rejects.toThrow("The authorization was declined.")
    expect(stopEditingCalls()).toHaveLength(0)
  })

  test("says what to fix when the market has no manual payment method", async () => {
    sdkClient.orders.retrieve.mockResolvedValue({
      ...orderWithPayments({
        totalCents: 2400,
        sessions: [{ id: "session1", status: "authorized", heldCents: 1200 }],
      }),
      available_payment_settings: [],
    })

    await expect(finish()).rejects.toThrow(
      "The USA wholesale market has no manual payment method. Add one, then finish editing.",
    )
    expect(stopEditingCalls()).toHaveLength(0)
  })
})
