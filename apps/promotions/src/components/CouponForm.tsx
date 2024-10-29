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
  Section,
  Spacer,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { type z } from 'zod'

interface Props {
  promotionId: string
  couponId?: string
  defaultValues?: Partial<z.infer<typeof couponForm>>
}

export function CouponForm({
  promotionId,
  couponId,
  defaultValues
}: Props): JSX.Element {
  const [, setLocation] = useLocation()
  const { promotion } = usePromotion(promotionId)
  const { mutateCoupon } = useCoupon(couponId)
  const methods = useForm<z.infer<typeof couponForm>>({
    defaultValues,
    resolver: zodResolver(couponForm)
  })

  const { sdkClient } = useCoreSdkProvider()

  return (
    <HookedForm
      {...methods}
      onSubmit={async (values): Promise<void> => {
        if (couponId != null) {
          await sdkClient.coupons.update({
            id: couponId,
            ...formValuesToCoupon(values)
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

          await sdkClient.coupons.create({
            ...formValuesToCoupon(values),
            promotion_rule: {
              type: 'coupon_codes_promotion_rules',
              id
            }
          })
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
              maxLength={40}
              label='Coupon code *'
              hint={{ text: '8 to 40 characters.' }}
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
      </Spacer>
    </HookedForm>
  )
}
