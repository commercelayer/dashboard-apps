import {
  type CurrencyCode,
  formatCentsToCurrency,
  formatDate,
  SkeletonTemplate,
  Td,
  Th,
  Tr,
  useAppLinking,
  useCoreApi,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { type FC, useLayoutEffect, useMemo, useRef, useState } from "react"
import { makeGiftCard } from "#mocks"
import { normalizeLogs } from "#utils/normalizeLogs"

export const BalanceLog = withSkeletonTemplate<{ giftCardId: string }>(
  ({ giftCardId }) => {
    const { user } = useTokenProvider()

    const { data: giftCard, isLoading } = useCoreApi(
      "gift_cards",
      "retrieve",
      [
        giftCardId,
        {
          fields: ["balance_log", "usage_log", "currency_code"],
        },
      ],
      {
        fallbackData: makeGiftCard(),
        revalidateOnFocus: false,
      },
    )

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

    if (isLoading) {
      return (
        <table className="w-full">
          <BalanceLogTableHeadings />
          <tbody>
            {["r1", "r2"].map((i) => (
              <tr key={i}>
                {["c1", "c2", "c3", "c4"].map((j) => (
                  <Td key={`${i}-${j}`}>
                    <SkeletonTemplate delayMs={0} isLoading>
                      Loading...
                    </SkeletonTemplate>
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (tableRows.length === 0) {
      return (
        <table className="w-full">
          <tbody>
            <tr>
              <td colSpan={4}>No balance log entries found.</td>
            </tr>
          </tbody>
        </table>
      )
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
      const el = tbodyRef.current
      // getBoundingClientRect().top + scrollY gives the absolute distance from
      // the document top to the tbody — correct regardless of current scroll
      // position, unlike offsetTop which is only relative to offsetParent.
      setScrollMargin(
        el != null ? el.getBoundingClientRect().top + window.scrollY : 0,
      )
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

  // Plain <tr><td> spacers (not app-elements Tr/Td) so they carry no bg-white,
  // no border, and no padding — completely invisible. This keeps the scrollbar
  // accurate without introducing a white gap or clipping borders via translateY.
  const paddingTop =
    firstItem != null ? firstItem.start - virtualizer.options.scrollMargin : 0
  const paddingBottom = lastItem != null ? totalSize - lastItem.end : 0

  return (
    <div>
      <table className="w-full">
        <BalanceLogTableHeadings />
        <tbody ref={tbodyRef}>
          {paddingTop > 0 && (
            <tr>
              <td
                colSpan={4}
                style={{ height: paddingTop, padding: 0, border: "none" }}
              >
                <div style={{ height: paddingTop }} />
              </td>
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const item = rows[virtualRow.index]
            if (item == null) return null

            return (
              <Tr key={virtualRow.key}>
                <Td>{formatCentsToCurrency(item.amountCents, currencyCode)}</Td>
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
                <Td>
                  {formatDate({
                    isoDate: item.isoDate,
                    format: "full",
                    timezone,
                    showCurrentYear: true,
                  })}
                </Td>
              </Tr>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td
                colSpan={4}
                style={{ height: paddingBottom, padding: 0, border: "none" }}
              >
                <div style={{ height: paddingBottom }} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const BalanceLogTableHeadings: FC = () => {
  return (
    <thead>
      <Tr>
        <Th
          style={{
            width: "25%",
          }}
        >
          AMOUNT
        </Th>
        <Th>TYPE</Th>
        <Th>ORDER</Th>
        <Th
          style={{
            width: "30%",
          }}
        >
          DATE
        </Th>
      </Tr>
    </thead>
  )
}
