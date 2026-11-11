import {
  Button,
  HookedInput,
  HookedInputSelect,
  HookedValidationApiError,
  Modal,
  ModalFooterButtons,
  Spacer,
  Text,
  useCoreSdkProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Customer, CustomerGroup } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { useCustomerGroupsList } from "#hooks/useCustomerGroupsList"
import { fetchCustomerGroups } from "#utils/fetchCustomerGroups"

const customerFormSchema = z.object({
  email: z.string().email(),
  customerGroup: z.string().nullable(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

interface Props {
  /** The customer to edit. Without it, the modal creates a new one. */
  customer?: Customer
  onClose: () => void
  /** Called with the created or updated customer, once the modal has closed. */
  onSaved: (customer: Customer) => void
}

/**
 * Creates or edits a customer. Laid out as the tags and metadata modals of
 * app-elements: the modal itself is the form, so the submit button in the footer
 * drives the fields in the body.
 */
export function CustomerFormModal({
  customer,
  onClose,
  onSaved,
}: Props): React.JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const { t } = useTranslation()
  const [apiError, setApiError] = useState<any>()

  const methods = useForm<CustomerFormValues>({
    defaultValues: {
      email: customer?.email ?? "",
      customerGroup: customer?.customer_group?.id ?? null,
    },
    resolver: zodResolver(customerFormSchema),
  })

  const { customerGroups } = useCustomerGroupsList({})
  /*
   * `isLoadingCustomerGroups` is needed/wanted here because `isLoading` prop available from `useCoreApi` does not reflect with precision the fact that data is filled or not.
   * It might happen that `isLoading` is `false` and `customerGroups` is still `undefined` for a while.
   */
  const isLoadingCustomerGroups = customerGroups === undefined

  const handleSubmit = methods.handleSubmit(async (values) => {
    const attributes = {
      email: values.email,
      customer_group: {
        id: values.customerGroup ?? null,
        type: "customer_groups" as const,
      },
    }

    try {
      const saved =
        customer != null
          ? await sdkClient.customers.update({ id: customer.id, ...attributes })
          : await sdkClient.customers.create(attributes)
      onClose()
      onSaved(saved)
    } catch (error) {
      setApiError(error)
    }
  })

  const resource = t("resources.customers.name").toLowerCase()

  return (
    // no DOM of its own, so it can span the modal's slots
    <FormProvider {...methods}>
      <Modal
        show
        size="medium"
        dismissible
        onClose={onClose}
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
      >
        <Modal.Header>
          {customer != null
            ? t("common.edit_resource", { resource })
            : t("common.new_resource", { resource })}
        </Modal.Header>
        <Modal.Body>
          <HookedInput
            name="email"
            label={t("resources.customers.attributes.email")}
            hint={{
              text: (
                <Text variant="info">
                  {t("apps.customers.form.email_hint")}
                </Text>
              ),
            }}
            autoComplete="off"
          />

          {!isLoadingCustomerGroups && (
            <Spacer top="6">
              <CustomerGroupSelect options={customerGroups} />
            </Spacer>
          )}
        </Modal.Body>
        <Modal.Footer>
          <HookedValidationApiError apiError={apiError} />
          <ModalFooterButtons>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="small"
              disabled={
                methods.formState.isSubmitting || isLoadingCustomerGroups
              }
            >
              {customer != null
                ? t("common.update_resource", { resource })
                : t("common.create_resource", { resource })}
            </Button>
          </ModalFooterButtons>
        </Modal.Footer>
      </Modal>
    </FormProvider>
  )
}

function CustomerGroupSelect({
  options,
}: {
  options: CustomerGroup[]
}): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()
  const { t } = useTranslation()

  return (
    <HookedInputSelect
      label={t("apps.customers.form.customer_group_label")}
      name="customerGroup"
      initialValues={options.map(({ id, name }) => ({
        value: id,
        label: name,
      }))}
      isClearable
      pathToValue="value"
      loadAsyncValues={async (hint) => {
        const list = await fetchCustomerGroups({ sdkClient, hint })
        return list.map(({ id, name }) => ({
          value: id,
          label: name,
        }))
      }}
      hint={{
        text: (
          <Text variant="info">
            {t("apps.customers.form.customer_group_hint")}
          </Text>
        ),
      }}
    />
  )
}
