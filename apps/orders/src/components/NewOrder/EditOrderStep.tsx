import { OrderLineItems } from '#components/OrderSummary/OrderLineItems'
import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Button,
  EmptyState,
  HookedForm,
  HookedInputCheckbox,
  HookedInputSelect,
  HookedValidationApiError,
  PageLayout,
  Section,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { z } from 'zod'
import { SelectCustomerComponent } from './SelectCustomerComponent'
import { availableLanguages } from './availableLanguages'

export const EditOrderStep: React.FC<
  Pick<PageProps<typeof appRoutes.new>, 'overlay'> & {
    orderId: string
  }
> = ({ overlay, orderId }) => {
  const [, setLocation] = useLocation()
  const [apiError, setApiError] = useState<any>()
  const { sdkClient } = useCoreSdkProvider()

  const { order, isLoading } = useOrderDetails(orderId)

  const methods = useForm<z.infer<typeof orderSchema>>({
    defaultValues: {
      language_code: 'en',
      at_least_one_sku: order.skus_count != null && order.skus_count > 0
    },
    resolver: zodResolver(orderSchema)
  })

  useEffect(() => {
    methods.setValue(
      'at_least_one_sku',
      order?.skus_count != null && order.skus_count > 0,
      { shouldValidate: methods.formState.isSubmitted }
    )

    if (order?.customer_email != null) {
      methods.resetField('customer_email', {
        defaultValue: order.customer_email
      })
    }
  }, [methods, order])

  if (order.status !== 'draft' && order.status !== 'pending') {
    return (
      <PageLayout
        title=''
        overlay={overlay}
        gap='only-top'
        navigationButton={{
          label: 'Close',
          icon: 'x',
          onClick() {
            setLocation(appRoutes.home.makePath({}))
          }
        }}
      >
        <EmptyState
          title='Not found'
          description='We could not find the resource you are looking for.'
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <span>
          <SkeletonTemplate isLoading={isLoading}>
            New order {order.market?.name}
          </SkeletonTemplate>
        </span>
      }
      overlay={overlay}
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='14'>
          <OrderLineItems title='Cart' order={order} />
        </Spacer>

        <HookedForm
          {...methods}
          onSubmit={async (formValues) => {
            if (order.skus_count === 0) {
              setApiError({
                errors: [
                  {
                    code: 42,
                    title:
                      'Cannot create the order without a valid SKU. Please select one.',
                    detail:
                      'Cannot create the order without a valid SKU. Please select one.'
                  }
                ]
              })
            } else {
              // All good!
              void sdkClient.orders
                .update({
                  id: order.id,
                  customer_email: formValues.customer_email,
                  language_code: formValues.language_code
                })
                .then(() => {
                  setLocation(
                    appRoutes.details.makePath({
                      orderId: order.id
                    })
                  )
                })
            }
          }}
        >
          <HookedInputCheckbox
            name='at_least_one_sku'
            style={{ display: 'none' }}
          />

          <Spacer top='14'>
            <Section title='Customer'>
              <Spacer top='6'>
                <SelectCustomerComponent />
              </Spacer>

              <Spacer top='6'>
                <HookedInputSelect
                  name='language_code'
                  label='Language *'
                  initialValues={availableLanguages}
                  hint={{ text: 'The language used for checkout.' }}
                />
              </Spacer>
            </Section>
          </Spacer>

          <Spacer top='14'>
            <Spacer top='8'>
              <Button
                type='submit'
                fullWidth
                disabled={methods.formState.isSubmitting}
              >
                Create order
              </Button>
              <Spacer top='2'>
                <HookedValidationApiError apiError={apiError} />
              </Spacer>
            </Spacer>
          </Spacer>
        </HookedForm>
      </SkeletonTemplate>
    </PageLayout>
  )
}

const orderSchema = z.object({
  at_least_one_sku: z
    .boolean()
    .refine(
      (value) => value,
      'Cannot create the order without a valid SKU. Please select at least one.'
    ),
  customer_email: z.string().email(),
  language_code: z
    .string()
    .refine(
      (value) => availableLanguages.map((l) => l.value).includes(value),
      'Invalid language'
    )
})
