import {
  Button,
  HookedInputSelect,
  HookedValidationApiError,
  Modal,
  ModalFooterButtons,
  Spacer,
  t,
  useCoreSdkProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { groupedLanguageList, languageList } from "../languages"
import { SelectCustomerComponent } from "../SelectCustomerComponent"

const validationSchema = z.object({
  customer_email: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type" && issue.input == null
          ? t("validation.required_field")
          : undefined,
    })
    .email(),
  language_code: z
    .string()
    .refine(
      (value) => languageList.map((l) => l.value as string).includes(value),
      "Invalid language",
    ),
})

export function useEditCustomerModal(order: Order, onChange?: () => void) {
  const { sdkClient } = useCoreSdkProvider()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [apiError, setApiError] = useState<any>()

  const formMethods = useForm({
    resolver: zodResolver(validationSchema),
  })

  // the modal stays mounted, so the form starts over from the order every time
  // it opens, rather than from what was typed and abandoned last time
  useEffect(() => {
    if (isOpen) {
      // the order can still lack these, and validation is what reports them
      formMethods.reset({
        customer_email: order.customer_email,
        language_code: order.language_code,
      } as z.input<typeof validationSchema>)
      setApiError(undefined)
    }
  }, [isOpen, order.customer_email, order.language_code])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const onSubmit = formMethods.handleSubmit(async (formValues) => {
    await sdkClient.orders
      .update({
        id: order.id,
        customer_email: formValues.customer_email,
        language_code: formValues.language_code,
      })
      .then(() => {
        onChange?.()
        close()
      })
      .catch((error) => {
        setApiError(error)
      })
  })

  return {
    open,
    // an element rather than a component: React then reconciles it by type on
    // every render, so the `Modal` is updated in place instead of being
    // remounted — a remount would skip the cleanup that releases the body
    // scroll lock, leaving the page stuck
    modal: (
      // no DOM of its own, so it can span the modal's slots and let the submit
      // button in the footer drive the fields in the body
      <FormProvider {...formMethods}>
        <Modal
          show={isOpen}
          onClose={close}
          size="medium"
          dismissible
          onSubmit={(event) => {
            void onSubmit(event)
          }}
        >
          <Modal.Header>
            {t("common.edit_resource", {
              resource: t("resources.customers.name").toLowerCase(),
            })}
          </Modal.Header>
          <Modal.Body>
            {/* the customer select queries the API: only while it can be seen */}
            {isOpen && (
              <>
                <SelectCustomerComponent />
                <Spacer top="6">
                  <HookedInputSelect
                    name="language_code"
                    label={`${t("apps.orders.form.language")} *`}
                    initialValues={groupedLanguageList}
                    hint={{ text: t("apps.orders.form.language_hint") }}
                  />
                </Spacer>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <ModalFooterButtons>
              <Button
                variant="secondary"
                type="button"
                size="small"
                onClick={close}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                size="small"
                disabled={formMethods.formState.isSubmitting}
              >
                {t("common.apply")}
              </Button>
            </ModalFooterButtons>
            <HookedValidationApiError apiError={apiError} />
          </Modal.Footer>
        </Modal>
      </FormProvider>
    ),
  }
}
