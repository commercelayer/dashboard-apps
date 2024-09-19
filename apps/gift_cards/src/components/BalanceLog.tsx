import { normalizeLogs } from '#utils/normalizeLogs'
import {
  navigateTo,
  Section,
  Table,
  Td,
  Th,
  Tr,
  useTokenProvider,
  withSkeletonTemplate,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { GiftCard } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

export const BalanceLog = withSkeletonTemplate<{ giftCard: GiftCard }>(
  ({ giftCard }) => {
    const { user } = useTokenProvider()
    const [, setLocation] = useLocation()

    const balanceLog = giftCard.balance_log as Parameters<
      typeof normalizeLogs
    >[0]['balanceLog']

    const tableRows = normalizeLogs({
      timezone: user?.timezone,
      currencyCode: giftCard.currency_code as CurrencyCode,
      usageLog: giftCard.usage_log,
      balanceLog
    })

    if (tableRows.length === 0) {
      return null
    }

    return (
      <Section title='Balance log' border='none'>
        <Table
          thead={
            <Tr>
              <Th>DATE</Th>
              <Th>TYPE</Th>
              <Th>ORDER</Th>
              <Th align='right'>AMOUNT</Th>
            </Tr>
          }
          tbody={tableRows.map((item, index) => (
            <Tr key={index}>
              <Td>{item.date}</Td>
              <Td>{item.type}</Td>
              <Td>
                {item.orderId != null ? (
                  <a
                    {...navigateTo({
                      setLocation,
                      destination: {
                        app: 'orders',
                        resourceId: item.orderId
                      }
                    })}
                  >
                    {item.orderNumber ?? item.orderId}
                  </a>
                ) : (
                  '—'
                )}
              </Td>
              <Td align='right'>{item.amount}</Td>
            </Tr>
          ))}
        />
      </Section>
    )
  }
)
