import {
  formatCentsToCurrency,
  formatDate,
  type CurrencyCode
} from '@commercelayer/app-elements'
import capitalize from 'lodash-es/capitalize'

interface NormalizedLogItem {
  date: string
  type: string
  orderId?: string
  orderNumber?: string
  amount: string
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
  timezone,
  currencyCode
}: {
  usageLog?: Record<OrderId, UsageLogItem[]> | null
  balanceLog?: BalanceLogItem[] | null
  timezone?: string
  currencyCode: CurrencyCode
}): NormalizedLogItem[] {
  const normalizedUsage = Object.entries(usageLog ?? {}).flatMap(
    ([orderId, items]) =>
      items.map((item) => ({
        date: item.datetime,
        type: capitalize(item.action),
        orderId,
        orderNumber: item.order_number,
        amount: formatCentsToCurrency(item.amount_cents, currencyCode)
      }))
  )

  const normalizedBalance = (balanceLog ?? [])
    .map((item) => ({
      date: item.datetime,
      type: 'Change',
      orderId: undefined,
      orderNumber: undefined,
      amount: formatCentsToCurrency(item.balance_change_cents, currencyCode)
    }))
    // remove duplicates from balance already present in usage, by considering same amount and date without milliseconds
    .filter((item) => {
      const dup = normalizedUsage.find(
        (o) =>
          removeMilliseconds(o.date) === removeMilliseconds(item.date) &&
          o.amount === item.amount
      )
      return dup == null
    })

  return [...normalizedUsage, ...normalizedBalance]
    .sort((a, b) => {
      return new Date(b.date).getTime() > new Date(a.date).getTime() ? 1 : -1
    })
    .map((item) => ({
      ...item,
      date: formatDate({
        isoDate: item.date,
        format: 'full',
        timezone,
        showCurrentYear: true
      })
    }))
}

function removeMilliseconds(date: string): string {
  return date.split('.')[0] ?? ''
}
