import {
  Button,
  HookedInput,
  HookedInputCheckbox,
  HookedInputDate,
  HookedValidationApiError,
  Hr,
  Modal,
  ModalFooterButtons,
  Spacer,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Coupon } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FC, useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import type { z } from "zod"
import {
  couponForm,
  couponToFormValues,
  formValuesToCoupon,
} from "#data/formConverters/coupon"
import { useCoupon } from "#hooks/useCoupon"
import { usePromotion } from "#hooks/usePromotion"

interface CouponFormModalProps {
  promotionId: string
  /** The coupon to edit. Without it, the modal creates a new one. */
  coupon?: Coupon
  onClose: (shouldReloadList?: boolean) => void
}

/**
 * Creates or edits a single coupon. Laid out as the tags and metadata modals of
 * app-elements: the modal itself is the form, so the submit button in the footer
 * drives the fields in the body.
 */
export const CouponFormModal: FC<CouponFormModalProps> = ({
  promotionId,
  coupon,
  onClose,
}) => {
  const couponId = coupon?.id
  const [apiError, setApiError] = useState<any>()
  const { promotion } = usePromotion(promotionId)
  const { mutateCoupon } = useCoupon(couponId)

  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
  const { t } = useTranslation()
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
    defaultValues: couponToFormValues(coupon),
    resolver: zodResolver(couponForm(minCodeLength, maxCodeLength)),
  })

  const handleSubmit = methods.handleSubmit(async (values) => {
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

    onClose(true)
  })

  return (
    // no DOM of its own, so it can span the modal's slots
    <FormProvider {...methods}>
      <Modal
        show
        size="large"
        dismissible
        onClose={() => {
          onClose()
        }}
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
      >
        <Modal.Header>
          {coupon != null ? "Edit coupon" : "Single coupon"}
        </Modal.Header>
        <Modal.Body>
          <HookedInput
            name="code"
            minLength={minCodeLength}
            maxLength={maxCodeLength}
            label="Code"
            hint={{
              text: `Enter a unique code (${minCodeLength}–${maxCodeLength} characters).`,
            }}
          />

          <Spacer top="6" bottom="6">
            <Hr variant="dashed" />
          </Spacer>

          {/* optional settings, each revealed by its checkbox as when generating
                multiple coupons. Unchecking one clears its field, which is then
                saved as empty. */}
          <Spacer bottom="2">
            <HookedInputCheckbox
              name="show_expires_at"
              checkedElement={
                <HookedInputDate
                  showTimeSelect
                  name="expires_at"
                  placeholder="Expiration date"
                  timezone={user?.timezone}
                />
              }
            >
              Set expiration date
            </HookedInputCheckbox>
          </Spacer>
          <Spacer bottom="2">
            <HookedInputCheckbox
              name="show_usage_limit"
              checkedElement={
                <HookedInput
                  type="number"
                  name="usage_limit"
                  placeholder="max usage"
                  min={1}
                  step={1}
                />
              }
            >
              Limit usage
            </HookedInputCheckbox>
          </Spacer>
          <Spacer bottom="2">
            <HookedInputCheckbox name="customer_single_use">
              Single use per customer
            </HookedInputCheckbox>
          </Spacer>
          <HookedInputCheckbox
            name="show_recipient_email"
            checkedElement={
              <HookedInput
                type="email"
                name="recipient_email"
                placeholder="Customer email"
              />
            }
          >
            Assign to a specific customer
          </HookedInputCheckbox>
        </Modal.Body>
        <Modal.Footer>
          <HookedValidationApiError apiError={apiError} />
          <ModalFooterButtons>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => {
                onClose()
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="small"
              disabled={methods.formState.isSubmitting}
            >
              {couponId != null ? "Update coupon" : "Create coupon"}
            </Button>
          </ModalFooterButtons>
        </Modal.Footer>
      </Modal>
    </FormProvider>
  )
}
