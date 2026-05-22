import {
  type CurrencyCode,
  formatCentsToCurrency,
  formatDate,
  Td,
  Th,
  Tr,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { GiftCard } from "@commercelayer/sdk"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { type FC, useLayoutEffect, useMemo, useRef, useState } from "react"
import { normalizeLogs } from "#utils/normalizeLogs"

export const BalanceLog = withSkeletonTemplate<{ giftCard: GiftCard }>(
  ({ giftCard }) => {
    const { user } = useTokenProvider()

    const balanceLog = giftCard.balance_log as Parameters<
      typeof normalizeLogs
    >[0]["balanceLog"]

    const tableRows = useMemo(
      () =>
        normalizeLogs({
          usageLog: giftCard.usage_log,
          balanceLog,
        }),
      [giftCard.usage_log, balanceLog],
    )

    if (tableRows.length === 0) {
      return null
    }

    return (
      <BalanceLogVirtualTable
        rows={tableRows}
        timezone={user?.timezone}
        currencyCode={giftCard.currency_code as CurrencyCode}
      />
    )
  },
)

type TableRow = ReturnType<typeof normalizeLogs>[number]

const ROW_ESTIMATE_PX = 54

const BalanceLogVirtualTable: FC<{
  rows: TableRow[]
  timezone?: string
  currencyCode: CurrencyCode
}> = ({ rows, timezone, currencyCode }) => {
  const { navigateTo } = useAppLinking()
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    const measure = (): void => {
      setScrollMargin(tbodyRef.current?.offsetTop ?? 0)
    }

    measure()

    // Re-measure when anything above the table shifts its position: font
    // loading, sticky-header height changes, or container reflows all alter
    // offsetTop without changing the tbody's own size. Observing document.body
    // covers those cases; the window "resize" listener covers pure viewport
    // changes where body dimensions may stay fixed (e.g. max-width layouts).
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(document.body)
    window.addEventListener("resize", measure)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 5,
    scrollMargin,
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
              <Td>
                {formatDate({
                  isoDate: item.isoDate,
                  format: "full",
                  timezone,
                  showCurrentYear: true,
                })}
              </Td>
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
              <Td align="right">
                {formatCentsToCurrency(item.amountCents, currencyCode)}
              </Td>
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
