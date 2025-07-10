import { couponForm, formValuesToCoupon } from '#data/formConverters/coupon'
import { appRoutes } from '#data/routes'
import { useCoupon } from '#hooks/useCoupon'
import { usePromotion } from '#hooks/usePromotion'
import {
  Button,
  HookedForm,
  HookedInput,
  HookedInputCheckbox,
  HookedInputDate,
  HookedValidationApiError,
  Section,
  Spacer,
  Text,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { type z } from 'zod'

interface Props {
  promotionId: string
  couponId?: string
  defaultValues?: Partial<z.infer<ReturnType<typeof couponForm>>>
}

export function CouponForm({
  promotionId,
  couponId,
  defaultValues
}: Props): React.JSX.Element {
  const [, setLocation] = useLocation()
  const [apiError, setApiError] = useState<any>()
  const { promotion } = usePromotion(promotionId)
  const { mutateCoupon } = useCoupon(couponId)

  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
  const { data: organization } = useCoreApi('organization', 'retrieve', [])
  const minCodeLength = useMemo(
    () => organization?.coupons_min_code_length ?? 8,
    [organization]
  )
  const maxCodeLength = useMemo(
    () => organization?.coupons_max_code_length ?? 40,
    [organization]
  )
  const methods = useForm<z.infer<ReturnType<typeof couponForm>>>({
    defaultValues,
    resolver: zodResolver(couponForm(minCodeLength, maxCodeLength))
  })

  return (
    <HookedForm
      {...methods}
      onSubmit={async (values): Promise<void> => {
        let hasError = false
        if (couponId != null) {
          await sdkClient.coupons
            .update({
              id: couponId,
              ...formValuesToCoupon(values)
            })
            .catch((error) => {
              hasError = true
              setApiError(error)
            })
        } else {
          let { id } = promotion?.coupon_codes_promotion_rule ?? {}

          if (id == null) {
            ;({ id } = await sdkClient.coupon_codes_promotion_rules.create({
              promotion: {
                id: promotion.id,
                type: promotion.type
              }
            }))
          }

          await sdkClient.coupons
            .create({
              ...formValuesToCoupon(values),
              promotion_rule: {
                type: 'coupon_codes_promotion_rules',
                id
              }
            })
            .catch((error) => {
              hasError = true
              setApiError(error)
            })
        }
        if (hasError) {
          return
        }

        await mutateCoupon()

        setLocation(
          appRoutes.promotionDetails.makePath({
            promotionId
          })
        )
      }}
    >
      <Spacer top='14'>
        <Section title='Basic info'>
          <Spacer top='6'>
            <HookedInput
              name='code'
              minLength={minCodeLength}
              maxLength={maxCodeLength}
              label='Coupon code *'
              hint={{
                text: `${minCodeLength} to ${maxCodeLength} characters.`
              }}
            />
          </Spacer>

          <Spacer top='6'>
            <HookedInputDate
              showTimeSelect
              name='expires_at'
              isClearable
              label='Expires on'
              hint={{
                text: 'Optionally set an expiration date for the coupon.'
              }}
              timezone={user?.timezone}
            />
          </Spacer>

          <Spacer top='6'>
            <HookedInput
              type='number'
              label='Usage limit'
              min={1}
              name='usage_limit'
              hint={{
                text: 'Optionally limit how many times this coupon can be used.'
              }}
            />
          </Spacer>
        </Section>
      </Spacer>

      <Spacer top='14'>
        <Section title='Customer options'>
          <Spacer top='6'>
            <Spacer bottom='2'>
              <HookedInputCheckbox
                name='show_recipient_email'
                checkedElement={
                  <Spacer bottom='6'>
                    <HookedInput
                      type='text'
                      name='recipient_email'
                      placeholder='Recipient email'
                    />
                  </Spacer>
                }
              >
                <Text weight='semibold'>Customer email</Text>
              </HookedInputCheckbox>
            </Spacer>

            <Spacer bottom='2'>
              <HookedInputCheckbox name='customer_single_use'>
                <Text weight='semibold'>Single use per customer</Text>
              </HookedInputCheckbox>
            </Spacer>
          </Spacer>
        </Section>
      </Spacer>

      <Spacer top='14'>
        <Button
          fullWidth
          type='submit'
          disabled={methods.formState.isSubmitting}
        >
          {couponId != null ? 'Update' : 'Create coupon'}
        </Button>
        <Spacer top='2'>
          <HookedValidationApiError apiError={apiError} />
        </Spacer>
      </Spacer>
    </HookedForm>
  )
}
