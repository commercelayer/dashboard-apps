import { OrderLineItems } from '#components/OrderSummary/OrderLineItems'
import { appRoutes } from '#data/routes'
import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Button,
  Card,
  EmptyState,
  HookedForm,
  HookedInputCheckbox,
  HookedInputSelect,
  HookedValidationApiError,
  PageLayout,
  Section,
  SkeletonTemplate,
  Spacer,
  t,
  useCoreSdkProvider,
  useTranslation,
  type PageProps
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { z } from 'zod'
import { SelectCustomerComponent } from './SelectCustomerComponent'
import { groupedLanguageList, languageList } from './languages'

export const EditOrderStep: React.FC<
  Pick<PageProps<typeof appRoutes.new>, 'overlay'> & {
    orderId: string
  }
> = ({ overlay, orderId }) => {
  const [, setLocation] = useLocation()
  const [apiError, setApiError] = useState<any>()
  const { sdkClient } = useCoreSdkProvider()
  const { t } = useTranslation()

  const { order, isLoading } = useOrderDetails(orderId)

  const methods = useForm<z.infer<typeof orderSchema>>({
    defaultValues: {
      language_code: 'en',
      at_least_one_sku: orderIsValid(order)
    },
    resolver: zodResolver(orderSchema)
  })

  useEffect(() => {
    methods.setValue('at_least_one_sku', orderIsValid(order), {
      shouldValidate: methods.formState.isSubmitted
    })

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
          label: t('common.close'),
          icon: 'x',
          onClick() {
            setLocation(appRoutes.home.makePath({}))
          }
        }}
      >
        <EmptyState
          title={t('common.empty_states.not_found')}
          description={t('common.empty_states.generic_not_found')}
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <span>
          <SkeletonTemplate isLoading={isLoading}>
            {t('common.new')} {t('resources.orders.name').toLowerCase()}{' '}
            {order.market?.name}
          </SkeletonTemplate>
        </span>
      }
      overlay={overlay}
      gap='only-top'
      navigationButton={{
        label: t('common.close'),
        icon: 'x',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='14'>
          <Card overflow='visible'>
            <OrderLineItems title={t('apps.orders.tasks.cart')} order={order} />
          </Card>
        </Spacer>

        <HookedForm
          {...methods}
          onSubmit={async (formValues) => {
            if (!orderIsValid(order)) {
              setApiError({
                errors: [
                  {
                    code: 42,
                    title: t('apps.orders.form.error_create_order')
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
            <Section title={t('resources.customers.name')}>
              <Spacer top='6'>
                <SelectCustomerComponent />
              </Spacer>

              <Spacer top='6'>
                <HookedInputSelect
                  name='language_code'
                  label={`${t('apps.orders.form.language')} *`}
                  initialValues={groupedLanguageList}
                  hint={{ text: t('apps.orders.form.language_hint') }}
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
                {t('common.create_resource', {
                  resource: t('resources.orders.name').toLowerCase()
                })}
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
    .refine((value) => value, t('apps.orders.form.error_create_order')),
  customer_email: z.string().email(),
  language_code: z
    .string()
    .refine(
      (value) => languageList.map((l) => l.value as string).includes(value),
      'Invalid language'
    )
})

function orderIsValid(order: Order): boolean {
  return (
    (
      order.line_items?.filter((item) => {
        return (
          item.item_type === 'adjustments' ||
          item.item_type === 'bundles' ||
          item.item_type === 'skus'
        )
      }) ?? []
    ).length > 0
  )
}
