import {
  type CurrencyCode,
  Td,
  Th,
  Tr,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { GiftCard } from "@commercelayer/sdk"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { type FC, useLayoutEffect, useRef } from "react"
import { normalizeLogs } from "#utils/normalizeLogs"

export const BalanceLog = withSkeletonTemplate<{ giftCard: GiftCard }>(
  ({ giftCard }) => {
    const { user } = useTokenProvider()

    const balanceLog = giftCard.balance_log as Parameters<
      typeof normalizeLogs
    >[0]["balanceLog"]

    const tableRows = normalizeLogs({
      timezone: user?.timezone,
      currencyCode: giftCard.currency_code as CurrencyCode,
      usageLog: giftCard.usage_log,
      balanceLog,
    })

    if (tableRows.length === 0) {
      return null
    }

    return <BalanceLogVirtualTable rows={tableRows} />
  },
)

type TableRow = ReturnType<typeof normalizeLogs>[number]

const ROW_ESTIMATE_PX = 54

const BalanceLogVirtualTable: FC<{
  rows: TableRow[]
}> = ({ rows }) => {
  const { navigateTo } = useAppLinking()
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const scrollMarginRef = useRef(0)

  useLayoutEffect(() => {
    scrollMarginRef.current = tbodyRef.current?.offsetTop ?? 0
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 10,
    scrollMargin: scrollMarginRef.current,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  const firstItem = virtualItems[0]
  const lastItem = virtualItems[virtualItems.length - 1]

  // Spacer rows above/below the rendered items make the table as tall as the
  // full dataset would be, keeping the page scrollbar accurate. This is the
  // table-compatible equivalent of the `height: getTotalSize()` wrapper div
  // used in div-based virtualizers, where `position: absolute` is not an option.
  const paddingTop =
    firstItem != null ? firstItem.start - virtualizer.options.scrollMargin : 0
  const paddingBottom = lastItem != null ? totalSize - lastItem.end : 0

  return (
    <table className="w-full">
      <thead>
        <Tr>
          <Th>DATE</Th>
          <Th>TYPE</Th>
          <Th>ORDER</Th>
          <Th align="right">AMOUNT</Th>
        </Tr>
      </thead>
      <tbody ref={tbodyRef}>
        {paddingTop > 0 && (
          <tr>
            <td style={{ height: paddingTop }} />
          </tr>
        )}
        {virtualItems.map((virtualRow) => {
          const item = rows[virtualRow.index]
          if (item == null) return null
          return (
            <Tr key={virtualRow.key}>
              <Td>{item.date}</Td>
              <Td>{item.type}</Td>
              <Td>
                {item.orderId != null ? (
                  <a
                    {...navigateTo({
                      app: "orders",
                      resourceId: item.orderId,
                    })}
                  >
                    {item.orderNumber ?? item.orderId}
                  </a>
                ) : (
                  "—"
                )}
              </Td>
              <Td align="right">{item.amount}</Td>
            </Tr>
          )
        })}
        {paddingBottom > 0 && (
          <tr>
            <td style={{ height: paddingBottom }} />
          </tr>
        )}
      </tbody>
    </table>
  )
}
