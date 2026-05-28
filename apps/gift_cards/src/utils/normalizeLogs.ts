import capitalize from "lodash-es/capitalize"

export interface NormalizedLogItem {
  isoDate: string
  type: string
  orderId?: string
  orderNumber?: string
  amountCents: number
}

interface UsageLogItem {
  action: string
  datetime: string
  amount_cents: number
  balance_cents: number
  order_number?: string
}

type OrderId = string

interface BalanceLogItem {
  datetime: string
  balance_change_cents: number
}

export function normalizeLogs({
  usageLog,
  balanceLog,
}: {
  usageLog?: Record<OrderId, UsageLogItem[]> | null
  balanceLog?: BalanceLogItem[] | null
}): NormalizedLogItem[] {
  const normalizedUsage = Object.entries(usageLog ?? {}).flatMap(
    ([orderId, items]) =>
      items.map((item) => ({
        isoDate: item.datetime,
        type: capitalize(item.action),
        orderId,
        orderNumber: item.order_number,
        amountCents: item.amount_cents,
      })),
  )

  // Build a Set of "dateWithoutMs:amountCents" keys for O(1) dedup lookup
  // instead of the O(n²) Array.find() approach.
  const usageKeys = new Set(
    normalizedUsage.map(
      (o) => `${removeMilliseconds(o.isoDate)}:${o.amountCents}`,
    ),
  )

  const normalizedBalance = (balanceLog ?? [])
    .map((item) => ({
      isoDate: item.datetime,
      type: "Change",
      orderId: undefined,
      orderNumber: undefined,
      amountCents: item.balance_change_cents,
    }))
    // Remove duplicates already present in usage (same timestamp and amount).
    .filter(
      (item) =>
        !usageKeys.has(
          `${removeMilliseconds(item.isoDate)}:${item.amountCents}`,
        ),
    )

  // ISO 8601 strings are lexicographically sortable — no Date object needed.
  return [...normalizedUsage, ...normalizedBalance].sort((a, b) =>
    a.isoDate < b.isoDate ? 1 : a.isoDate > b.isoDate ? -1 : 0,
  )
}

function removeMilliseconds(date: string): string {
  return date.replace(/\.\d+/, "")
}
