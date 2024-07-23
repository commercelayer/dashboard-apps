import { csvGiftCardsSchema } from './giftCards'

describe('Validate csvGiftCardsSchema', () => {
  test('received input should have a valid schema', () => {
    expect(
      csvGiftCardsSchema.parse([
        {
          code: 'XXXX123123',
          currency_code: 'EUR',
          balance_cents: '5000'
        },
        {
          code: 'ABC123471623',
          currency_code: 'EUR',
          balance_cents: 30000,
          market_id: 'market:1234',
          gift_card_recipient_id: 'xYZkjABcde'
        },
        {
          code: 'with-iso-date',
          currency_code: 'EUR',
          balance_cents: 14000,
          single_use: 'true',
          expires_at: '2022-07-22T11:15:04.388Z'
        },
        {
          code: 'with-incomplete-date',
          currency_code: 'EUR',
          balance_cents: 30000,
          expires_at: '2022-07-22'
        },
        {
          code: 'XXXX123125',
          currency_code: 'EUR',
          balance_cents: '0'
        }
      ])
    ).toStrictEqual([
      {
        code: 'XXXX123123',
        currency_code: 'EUR',
        balance_cents: 5000
      },
      {
        code: 'ABC123471623',
        currency_code: 'EUR',
        balance_cents: 30000,
        market_id: 'market:1234',
        gift_card_recipient_id: 'xYZkjABcde'
      },
      {
        code: 'with-iso-date',
        currency_code: 'EUR',
        balance_cents: 14000,
        single_use: true,
        expires_at: '2022-07-22T11:15:04.388Z'
      },
      {
        code: 'with-incomplete-date',
        currency_code: 'EUR',
        balance_cents: 30000,
        expires_at: '2022-07-22T00:00:00.000Z'
      },
      {
        code: 'XXXX123125',
        currency_code: 'EUR',
        balance_cents: 0
      }
    ])
  })

  test('should require one of currency_code or market_id', () => {
    const noCurrencyAndMarket = csvGiftCardsSchema.safeParse([
      {
        code: 'XXXX123123',
        balance_cents: '5000'
      }
    ])

    const withCurrencyCode = csvGiftCardsSchema.safeParse([
      {
        code: 'XXXX123123',
        balance_cents: '5000',
        currency_code: 'EUR'
      }
    ])

    const withMarket = csvGiftCardsSchema.safeParse([
      {
        code: 'XXXX123123',
        balance_cents: '5000',
        market_id: 'kvDwaSlWq'
      }
    ])

    expect(noCurrencyAndMarket.success).toBe(false)
    expect(withCurrencyCode.success).toBe(true)
    expect(withMarket.success).toBe(true)
  })

  test('code should be min 8 chars length', () => {
    const codeIsShort = csvGiftCardsSchema.safeParse([
      {
        code: '1234567',
        balance_cents: '5000',
        currency_code: 'EUR'
      }
    ])
    const codeIsGood = csvGiftCardsSchema.safeParse([
      {
        code: '12345678',
        balance_cents: '5000',
        currency_code: 'EUR'
      }
    ])

    expect(codeIsShort.success).toBe(false)
    expect(codeIsGood.success).toBe(true)
  })
})
