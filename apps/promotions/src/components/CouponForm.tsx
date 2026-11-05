import {
  Button,
  HookedForm,
  HookedInput,
  HookedInputCheckbox,
  HookedInputDate,
  HookedValidationApiError,
  Spacer,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { couponForm, formValuesToCoupon } from "#data/formConverters/coupon"
import { useCoupon } from "#hooks/useCoupon"
import { usePromotion } from "#hooks/usePromotion"

interface Props {
  promotionId: string
  couponId?: string
  defaultValues?: Partial<z.infer<ReturnType<typeof couponForm>>>
  onSuccess: () => void
}

export function CouponForm({
  promotionId,
  couponId,
  defaultValues,
  onSuccess,
}: Props): React.JSX.Element {
  const [apiError, setApiError] = useState<any>()
  const { promotion } = usePromotion(promotionId)
  const { mutateCoupon } = useCoupon(couponId)

  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
  const { data: organization } = useCoreApi("organization", "retrieve", [])
  const minCodeLength = useMemo(
    () => organization?.coupons_min_code_length ?? 8,
    [organization],
  )
  const maxCodeLength = useMemo(
    () => organization?.coupons_max_code_length ?? 40,
    [organization],
  )
  const methods = useForm<
    z.input<ReturnType<typeof couponForm>>,
    unknown,
    z.output<ReturnType<typeof couponForm>>
  >({
    defaultValues,
    resolver: zodResolver(couponForm(minCodeLength, maxCodeLength)),
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
              ...formValuesToCoupon(values),
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
                type: promotion.type,
              },
            }))
          }

          await sdkClient.coupons
            .create({
              ...formValuesToCoupon(values),
              promotion_rule: {
                type: "coupon_codes_promotion_rules",
                id,
              },
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

        onSuccess()
      }}
    >
      <Spacer bottom="8">
        <HookedInput
          name="code"
          minLength={minCodeLength}
          maxLength={maxCodeLength}
          label="Coupon code *"
          hint={{
            text: `${minCodeLength} to ${maxCodeLength} characters.`,
          }}
        />
      </Spacer>

      <Spacer bottom="8">
        <HookedInputDate
          showTimeSelect
          name="expires_at"
          isClearable
          label="Expires on"
          hint={{
            text: "Optionally set an expiration date for the coupon.",
          }}
          timezone={user?.timezone}
        />
      </Spacer>

      <Spacer bottom="8">
        <HookedInput
          type="number"
          label="Usage limit"
          min={1}
          name="usage_limit"
          hint={{
            text: "Optionally limit how many times this coupon can be used.",
          }}
        />
      </Spacer>

      <Spacer bottom="2">
        <HookedInputCheckbox
          name="show_recipient_email"
          checkedElement={
            <HookedInput
              type="text"
              name="recipient_email"
              placeholder="Recipient email"
            />
          }
        >
          Customer email
        </HookedInputCheckbox>
      </Spacer>
      <Spacer bottom="12">
        <HookedInputCheckbox name="customer_single_use">
          Single use per customer
        </HookedInputCheckbox>
      </Spacer>

      <Button fullWidth type="submit" disabled={methods.formState.isSubmitting}>
        {couponId != null ? "Update coupon" : "Create coupon"}
      </Button>
      <Spacer top="2">
        <HookedValidationApiError apiError={apiError} />
      </Spacer>
    </HookedForm>
  )
}
