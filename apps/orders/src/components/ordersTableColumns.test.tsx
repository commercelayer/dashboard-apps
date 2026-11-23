import type { Order } from "@commercelayer/sdk"
import { renderToStaticMarkup } from "react-dom/server"
import { useOrdersTableColumns } from "#components/ordersTableColumns"

vi.mock("@commercelayer/app-elements", async (importOriginal) => {
  return {
    ...((await importOriginal()) satisfies Record<string, unknown>),
    useTokenProvider: () => ({ user: null }),
  }
})

function AmountCell({ resource }: { resource: Order }) {
  const amount = useOrdersTableColumns("order.placed_at").find(
    (column) => column.id === "amount",
  )
  return <>{amount?.cell({ resource })}</>
}

function NumberCell({ resource }: { resource: Order }) {
  const [number] = useOrdersTableColumns("order.placed_at")
  return <>{number?.cell({ resource })}</>
}

describe("useOrdersTableColumns", () => {
  // the Customer column is hidden on mobile, so the customer rides with the number
  test("the number cell shows the customer's email on mobile", () => {
    const markup = renderToStaticMarkup(
      <NumberCell
        resource={
          {
            number: "123",
            status: "placed",
            customer: { email: "jane@example.com" },
          } as Order
        }
      />,
    )

    expect(markup).toMatch(/<div class="[^"]*md:hidden[^"]*">jane@example.com</)
  })

  test("the number cell shows the billing name of a guest order with no email", () => {
    const markup = renderToStaticMarkup(
      <NumberCell
        resource={
          {
            number: "123",
            status: "placed",
            billing_address: { company: "Acme Inc." },
          } as Order
        }
      />,
    )

    expect(markup).toMatch(/<div class="[^"]*md:hidden[^"]*">Acme Inc.</)
  })

  test("the number cell has no customer line when the order has no customer", () => {
    const markup = renderToStaticMarkup(
      <NumberCell resource={{ number: "123", status: "placed" } as Order} />,
    )

    // only the mobile status badge and date: no customer line, not even a dash
    expect(markup.match(/md:hidden/g)).toHaveLength(2)
    expect(markup).not.toContain("—")
  })

  // with prices that don't include taxes, `total_amount` leaves the taxes out
  test("the amount column shows the total with taxes", () => {
    const markup = renderToStaticMarkup(
      <AmountCell
        resource={
          {
            formatted_subtotal_amount: "$4,845.00",
            formatted_total_amount: "$4,845.00",
            formatted_total_amount_with_taxes: "$5,341.63",
          } as Order
        }
      />,
    )

    expect(markup).toContain("$5,341.63")
    expect(markup).not.toContain("$4,845.00")
  })
})
