import {
  Avatar,
  Card,
  CopyToClipboard,
  formatCentsToCurrency,
  formatDate,
  HookedForm,
  HookedInputCheckbox,
  Icon,
  InputCheckbox,
  InputSpinner,
  ListItem,
  Spacer,
  Table,
  Td,
  Text,
  Tooltip,
  Tr,
  useTokenProvider,
  type CurrencyCode,
  type TextProps
} from '@commercelayer/app-elements'
import type {
  Capture,
  LineItem,
  Order,
  Refund,
  ReturnLineItem
} from '@commercelayer/sdk'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SetFieldType } from 'type-fest'

type FieldValues = {
  shippingMethod: boolean
  paymentMethod: boolean
  taxes: boolean
  discounts: boolean
  adjustments: boolean
  manualAdjustments: boolean
  giftCard: boolean
} & Record<`refund-${string}`, boolean>

export function RefundEstimator({
  capture,
  currencyCode,
  lineItems,
  order
}: {
  capture: Capture
  currencyCode: string | null | undefined
  lineItems: LineItem[] | ReturnLineItem[] | null | undefined
  order?: Order | null | undefined
}): React.ReactNode {
  const { user } = useTokenProvider()
  const formMethods = useForm<FieldValues>({
    defaultValues: {
      shippingMethod: true,
      paymentMethod: true,
      taxes: true,
      discounts: true,
      adjustments: true,
      manualAdjustments: true,
      giftCard: true,
      ...order?.refunds?.reduce(
        (acc, cv) => ({ ...acc, [getRefundName(cv)]: true }),
        {}
      )
    }
  })

  const [lineItemsAmounts, setLineItemsAmounts] = useState<
    Array<{
      total: number
      tax: number
      discount: number
    }>
  >([])

  const [totalRefundEstimate, setTotalRefundEstimate] = useState<number>(0)

  const [refundEstimate, setRefundEstimate] = useState<
    SetFieldType<FieldValues, keyof FieldValues, number> & {
      lineItems: number
    }
  >({
    lineItems: 0,
    shippingMethod: 0,
    paymentMethod: 0,
    taxes: 0,
    discounts: 0,
    adjustments: 0,
    manualAdjustments: 0,
    giftCard: 0,
    ...order?.refunds?.reduce(
      (acc, cv) => ({ ...acc, [getRefundName(cv)]: 0 }),
      {}
    )
  })

  function sumAmount(
    property: keyof (typeof lineItemsAmounts)[number]
  ): number {
    return lineItemsAmounts.reduce<number>((acc, cv) => acc + cv[property], 0)
  }

  console.log('lineItemsAmounts', lineItemsAmounts)
  console.log('refundEstimate', refundEstimate)
  console.log('totalRefundEstimate', totalRefundEstimate)

  useEffect(() => {
    setRefundEstimate({
      lineItems: sumAmount('total'),
      shippingMethod: order?.shipping_amount_cents ?? 0,
      adjustments: order?.adjustment_amount_cents ?? 0,
      discounts: sumAmount('discount'),
      giftCard: 0, // order?.gift_card_amount_cents ?? 0,
      manualAdjustments: 0,
      paymentMethod: order?.payment_method_amount_cents ?? 0,
      taxes: order?.tax_included !== true ? sumAmount('tax') : 0,
      ...order?.refunds?.reduce(
        (acc, cv) => ({ ...acc, [getRefundName(cv)]: cv.amount_cents * -1 }),
        {}
      )
    })
  }, [lineItemsAmounts, order])

  useEffect(() => {
    setTotalRefundEstimate(
      Object.entries(refundEstimate).reduce((acc, cv) => {
        const [key, amount] = cv as [keyof typeof refundEstimate, number]

        if (key === 'lineItems') {
          return acc + amount
        }

        const checked = formMethods.getValues(key)

        if (checked) {
          return acc + amount
        }

        return acc
      }, 0)
    )
  }, [refundEstimate, formMethods.formState])

  return (
    <Spacer bottom='10'>
      <Card
        gap='none'
        footer={
          <ListItem padding='x' borderStyle='none'>
            <Text size='small'>
              Paid on{' '}
              {formatDate({
                format: 'full',
                isoDate: capture.created_at,
                timezone: user?.timezone
              })}{' '}
              {order?.payment_method?.name != null
                ? `via ${order?.payment_method.name}`
                : ''}
            </Text>
            <Text size='small'>{capture.formatted_amount}</Text>
          </ListItem>
        }
      >
        <Table
          tbody={lineItems
            ?.filter((line) => {
              const lineItem =
                line.type === 'line_items' ? line : line.line_item

              return (
                lineItem?.item_type === 'bundles' ||
                lineItem?.item_type === 'skus'
              )
            })
            .map((lineItem, index) => {
              return (
                <LineItemRow
                  key={lineItem?.id}
                  lineItem={lineItem}
                  onChange={(amount) => {
                    setLineItemsAmounts((prevState) => {
                      prevState[index] = amount
                      return [...prevState]
                    })
                  }}
                />
              )
            })}
        />
        <HookedForm onSubmit={() => {}} {...formMethods}>
          <Spacer top='6' bottom='6'>
            <Spacer top='4' bottom='4'>
              <SummaryRow
                name='shippingMethod'
                label={
                  order?.shipments?.length === 1
                    ? (order?.shipments[0]?.shipping_method?.name ?? 'Shipping')
                    : 'Shipping'
                }
                amountCents={refundEstimate.shippingMethod}
                currencyCode={currencyCode}
              />
            </Spacer>
            <Spacer top='4' bottom='4'>
              <SummaryRow
                name='paymentMethod'
                label={order?.payment_method?.name ?? 'Payment method'}
                amountCents={refundEstimate.paymentMethod}
                currencyCode={currencyCode}
              />
            </Spacer>
            <Spacer top='4' bottom='4'>
              <SummaryRow
                name='taxes'
                label='Taxes'
                amountCents={refundEstimate.taxes}
                currencyCode={currencyCode}
              />
            </Spacer>
            <Spacer top='4' bottom='4'>
              <SummaryRow
                name='discounts'
                label='Discounts'
                amountCents={refundEstimate.discounts}
                currencyCode={currencyCode}
              />
            </Spacer>
            <Spacer top='4' bottom='4'>
              <SummaryRow
                name='adjustments'
                label='Adjustment'
                amountCents={refundEstimate.adjustments}
                currencyCode={currencyCode}
              />
            </Spacer>
            <Spacer top='4' bottom='4'>
              <SummaryRow
                name='giftCard'
                label='Gift card'
                amountCents={refundEstimate.giftCard}
                currencyCode={currencyCode}
              />
            </Spacer>

            {order?.refunds?.map((refund) => (
              <Spacer key={refund.id} top='4' bottom='4'>
                <SummaryRow
                  name={getRefundName(refund)}
                  label={`Refunded on ${formatDate({ format: 'full', isoDate: refund.created_at, timezone: user?.timezone })}`}
                  amountCents={refundEstimate[getRefundName(refund)]}
                  currencyCode={currencyCode}
                />
              </Spacer>
            ))}

            <Spacer top='10'>
              <ListItem padding='x' borderStyle='none'>
                <Text weight='bold'>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}
                  >
                    Refund estimate{' '}
                    <Tooltip
                      direction='bottom-start'
                      label={<Icon name='info' />}
                      content={
                        <div>
                          The refund estimate is an
                          <br />
                          approximate value and may differ
                          <br />
                          from the original payment.
                        </div>
                      }
                    />
                  </div>
                </Text>
                <Text weight='bold' style={{ display: 'flex', gap: '.5rem' }}>
                  <CopyToClipboard
                    showValue={false}
                    value={formatCentsToCurrency(
                      totalRefundEstimate ?? 0,
                      currencyCode as CurrencyCode
                    )}
                  />
                  {formatCentsToCurrency(
                    totalRefundEstimate ?? 0,
                    currencyCode as CurrencyCode
                  )}
                </Text>
              </ListItem>
            </Spacer>
          </Spacer>
        </HookedForm>
      </Card>
    </Spacer>
  )
}

function getRefundName(refund: Refund): `refund-${string}` {
  return `refund-${refund.id}`
}

function LineItemRow({
  lineItem,
  onChange
}: {
  lineItem: LineItem | ReturnLineItem
  onChange?: (amountCents: {
    total: number
    tax: number
    discount: number
  }) => void
}): React.JSX.Element {
  const [checked, setChecked] = useState<boolean>(true)
  const [quantity, setQuantity] = useState<number>(lineItem.quantity)
  const textVariant: TextProps['variant'] = checked ? 'primary' : 'disabled'
  const [totalAmountCents, setTotalAmountCents] = useState<number>(0)

  const item = lineItem.type === 'line_items' ? lineItem : lineItem.line_item

  useEffect(() => {
    setTotalAmountCents(quantity * (item?.unit_amount_cents ?? 0))

    onChange?.(
      checked
        ? {
            total: quantity * (item?.unit_amount_cents ?? 0),
            discount:
              quantity * ((item?.discount_cents ?? 0) / lineItem.quantity),
            tax: quantity * ((item?.tax_amount_cents ?? 0) / lineItem.quantity)
          }
        : {
            total: 0,
            discount: 0,
            tax: 0
          }
    )
  }, [checked, quantity])

  return (
    <Tr>
      <Td style={{ borderStyle: 'dashed', fontSize: '1rem' }}>
        <InputCheckbox
          checked={checked}
          onChange={() => {
            setChecked((prev) => !prev)
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <Avatar
              size='small'
              alt={lineItem.name ?? ''}
              src={lineItem.image_url as `https://${string}`}
            />
            <Text variant={textVariant} weight='medium'>
              {lineItem.name}
            </Text>
          </div>
        </InputCheckbox>
      </Td>
      <Td style={{ borderStyle: 'dashed', fontSize: '1rem' }}>
        <InputSpinner
          defaultValue={lineItem.quantity}
          min={1}
          max={lineItem.quantity}
          disableKeyboard
          disabled={!checked}
          onChange={(newQuantity) => {
            setQuantity(newQuantity)
          }}
        />
      </Td>
      <Td
        align='right'
        style={{ borderStyle: 'dashed', fontSize: '1rem', minWidth: '110px' }}
      >
        <Text wrap='nowrap' weight='medium' variant={textVariant}>
          {formatCentsToCurrency(
            totalAmountCents,
            item?.currency_code as CurrencyCode
          )}
        </Text>
      </Td>
    </Tr>
  )
}

function SummaryRow({
  name,
  label,
  amountCents,
  currencyCode
}: {
  name: keyof FieldValues
  label: string
  amountCents: number | null | undefined
  currencyCode: string | null | undefined
}): React.ReactNode {
  if (amountCents == null || amountCents === 0 || currencyCode == null) {
    return null
  }

  return (
    <ListItem padding='x' borderStyle='none'>
      <HookedInputCheckbox key={name} name={name}>
        {label}
      </HookedInputCheckbox>
      {formatCentsToCurrency(amountCents, currencyCode as CurrencyCode)}
    </ListItem>
  )
}
