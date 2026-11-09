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

describe("useOrdersTableColumns", () => {
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
