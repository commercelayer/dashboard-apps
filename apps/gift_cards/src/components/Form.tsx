import { SelectCustomer } from '#components/SelectCustomer'
import { appRoutes } from '#data/routes'
import {
  Button,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputCheckbox,
  HookedInputCurrency,
  HookedInputDate,
  HookedMarketWithCurrencySelector,
  HookedValidationApiError,
  Icon,
  Section,
  Spacer,
  Tooltip,
  useTokenProvider,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { GiftCard } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import isEmpty from 'lodash-es/isEmpty'
import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { z } from 'zod'

const formSchema = z
  .object({
    code: z.preprocess(
      (val) => (isEmpty(val) ? null : val),
      z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine(
          (value) => {
            return value == null ? true : value.length >= 8
          },
          {
            message:
              'When provided, the code must be at least 8 characters long'
          }
        )
    ),
    market: z.string(),
    currency_code: z.string(),
    balance_cents: z.number().int().min(0),
    balance_max_cents: z.number().int().optional().nullable(),
    expires_at: z
      .date({
        required_error: 'Please enter a valid date',
        invalid_type_error: 'Please enter a valid date'
      })
      .optional()
      .nullable(),
    recipient_email: z.string().optional().nullable(),
    image_url: z.string().trim().url().optional().nullable().or(z.literal('')),
    single_use: z.boolean(),
    rechargeable: z.boolean(),
    distribute_discount: z.boolean()
  })
  .superRefine((values, ctx) => {
    if (isEmpty(values.currency_code) && isEmpty(values.market)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currency_code'],
        message: 'Please select a currency'
      })
    }
  })

type GiftCardFormValues = z.infer<typeof formSchema>

const makeDefaultValue = (giftCart?: GiftCard): GiftCardFormValues => {
  return {
    code: giftCart?.code ?? '',
    market: giftCart?.market?.id ?? '',
    currency_code: giftCart?.currency_code ?? 'USD',
    balance_cents: giftCart?.balance_cents ?? 0,
    balance_max_cents: giftCart?.balance_max_cents ?? null,
    expires_at:
      giftCart?.expires_at != null ? new Date(giftCart.expires_at) : null,
    recipient_email: giftCart?.recipient_email ?? null,
    image_url: giftCart?.image_url ?? null,
    single_use: giftCart?.single_use ?? false,
    rechargeable: giftCart?.rechargeable ?? false,
    distribute_discount: giftCart?.distribute_discount ?? false
  }
}

export const Form: FC<{
  giftCard?: GiftCard
  onSubmit: (formValues: GiftCardFormValues) => Promise<GiftCard>
}> = ({ giftCard, onSubmit }) => {
  const [apiError, setApiError] = useState<any>()
  const [, setLocation] = useLocation()
  const { user } = useTokenProvider()
  const isNew = giftCard?.id == null

  const methods = useForm({
    defaultValues: makeDefaultValue(giftCard),
    resolver: zodResolver(formSchema)
  })

  const currencyCode = methods.watch('currency_code') as CurrencyCode

  return (
    <HookedForm
      {...methods}
      onSubmit={(formValues) => {
        onSubmit(formValues)
          .then((res) => {
            setLocation(appRoutes.details.makePath({ giftCardId: res.id }))
          })
          .catch((error) => {
            setApiError(error)
            throw error
          })
      }}
    >
      <Section title='Balance'>
        {isNew && (
          <Spacer top='6'>
            <HookedInput
              label='Code'
              name='code'
              hint={{
                text: 'Optional unique card code. If not provided, a random code will be generated.'
              }}
            />
          </Spacer>
        )}

        <Spacer top='6'>
          <HookedMarketWithCurrencySelector
            label='Market *'
            fieldNameMarket='market'
            fieldNameCurrencyCode='currency_code'
            hint={{
              text: 'Market where the card can be used.'
            }}
          />
        </Spacer>
        <Grid columns='2'>
          <Spacer top='6'>
            <HookedInputCurrency
              name='balance_cents'
              label='Balance *'
              currencyCode={currencyCode}
              hint={{
                text: 'Value of the gift card'
              }}
            />
          </Spacer>
          <Spacer top='6'>
            <HookedInputCurrency
              name='balance_max_cents'
              label='Max balance'
              currencyCode={currencyCode}
              hint={{
                text: 'Maximum value of the gift card'
              }}
            />
          </Spacer>
        </Grid>
      </Section>

      <Spacer top='14'>
        <Section title='Additional info'>
          <Spacer top='6'>
            <HookedInputDate
              name='expires_at'
              label='Expiration date'
              showTimeSelect
              isClearable
              hint={{
                text: 'Up to when the card can be used.'
              }}
              timezone={user?.timezone}
            />
          </Spacer>
          <Spacer top='6'>
            <SelectCustomer
              name='recipient_email'
              label='Customer email'
              hint={{
                text: 'The customer associated with the card'
              }}
              isClearable
            />
          </Spacer>
          <Spacer top='6'>
            <HookedInput
              name='image_url'
              label='Image URL'
              hint={{
                text: 'A valid image URL, hosted anywhere.'
              }}
            />
          </Spacer>
        </Section>
      </Spacer>

      <Spacer top='14'>
        <Section title='Options'>
          <Spacer top='6'>
            <HookedInputCheckbox name='rechargeable'>
              The card is rechargeable
            </HookedInputCheckbox>
          </Spacer>
          <Spacer top='2'>
            <HookedInputCheckbox name='single_use'>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                The card can only be used once
                <Tooltip
                  label={<Icon name='info' />}
                  content='Single-use cards are redeemed on first use, regardless of balance.'
                />
              </div>
            </HookedInputCheckbox>
          </Spacer>
          <Spacer top='2'>
            <HookedInputCheckbox name='distribute_discount'>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                The card discount is distributed for tax calculation
                <Tooltip
                  label={<Icon name='info' />}
                  content='If flagged, the discount generated by the gift card amount is distributed for tax calculation.'
                />
              </div>
            </HookedInputCheckbox>
          </Spacer>
        </Section>
      </Spacer>

      <Spacer top='14'>
        <Button type='submit' className='w-full'>
          {isNew ? 'Create' : 'Update'}
        </Button>
        <Spacer top='2'>
          <HookedValidationApiError apiError={apiError} />
        </Spacer>
      </Spacer>
    </HookedForm>
  )
}
