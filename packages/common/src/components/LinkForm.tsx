import {
  Button,
  Grid,
  Hint,
  HookedForm,
  HookedInput,
  HookedInputDate,
  HookedInputSelect,
  HookedValidationApiError,
  SkeletonTemplate,
  Spacer,
  Text,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { StockLocation } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { addMonths } from 'date-fns/addMonths'
import { useEffect, useState } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { RelationshipSelector } from './RelationshipSelector'

const linkFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  clientId: z.string().min(1),
  market: z.string().min(1),
  stockLocation: z.string().optional(),
  startsAt: z.date(),
  expiresAt: z.date()
})

export type LinkFormValues = z.infer<typeof linkFormSchema>

interface Props {
  resourceType: 'orders' | 'skus' | 'sku_lists'
  defaultValues?: Partial<LinkFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: LinkFormValues,
    setError: UseFormSetError<LinkFormValues>
  ) => void
  apiError?: any
}

export function LinkForm({
  resourceType,
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): React.JSX.Element {
  const linkFormMethods = useForm<LinkFormValues>({
    defaultValues,
    resolver: zodResolver(linkFormSchema)
  })
  const { settings } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const salesChannels = settings.extras?.salesChannels

  const { data: marketData, isLoading } = useCoreApi(
    'markets',
    'list',
    [
      {
        filters: {
          customer_group_null: true,
          private_true: false,
          disabled_at_null: true
        },
        fields: ['id', 'name'],
        sort: ['name'],
        pageSize: 1
      }
    ],
    {}
  )
  const isSingleMarketId =
    marketData?.[0] != null && marketData?.meta.recordCount === 1
      ? marketData[0].id
      : null

  const [stockLocations, setStockLocations] = useState<StockLocation[]>()
  const defaultStockLocation = { value: '', label: 'All stock locations' }
  const selectedMarket = linkFormMethods.watch('market')

  useEffect(() => {
    if (selectedMarket != null) {
      void sdkClient.markets
        .retrieve(selectedMarket, {
          fields: ['id', 'name', 'inventory_model'],
          include: [
            'inventory_model',
            'inventory_model.inventory_stock_locations',
            'inventory_model.inventory_stock_locations.stock_location'
          ]
        })
        .then((market) => {
          const marketsStockLocations: StockLocation[] = []
          market.inventory_model?.inventory_stock_locations?.forEach(
            (stockLocation) => {
              if (stockLocation?.stock_location != null) {
                marketsStockLocations.push(stockLocation.stock_location)
              }
            }
          )
          setStockLocations(marketsStockLocations)
          if (
            defaultValues?.stockLocation == null &&
            marketsStockLocations.length >= 2
          ) {
            linkFormMethods.setValue('stockLocation', '')
          }
        })
    }
  }, [selectedMarket])

  const isAdvancedForm = resourceType !== 'orders'
  const isCreateForm = defaultValues?.id == null

  // Set creation form defaults for advanced forms
  useEffect(() => {
    if (isAdvancedForm && !isLoading && isCreateForm) {
      if (salesChannels != null && salesChannels.length > 0) {
        linkFormMethods.setValue('clientId', salesChannels[0]?.client_id ?? '')
      }
      if (isSingleMarketId != null) {
        linkFormMethods.setValue('market', isSingleMarketId)
      }
      linkFormMethods.setValue('startsAt', new Date())
      linkFormMethods.setValue('expiresAt', addMonths(new Date(), 1))
    }
  }, [
    resourceType,
    isLoading,
    defaultValues,
    salesChannels,
    isSingleMarketId,
    linkFormMethods
  ])

  return (
    <SkeletonTemplate isLoading={isLoading}>
      <HookedForm
        {...linkFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, linkFormMethods.setError)
        }}
      >
        {isAdvancedForm && (
          <Spacer top='6' bottom='4'>
            <HookedInput
              name='name'
              label='Name *'
              hint={{
                text: (
                  <Text variant='info'>
                    Pick a name that helps you identify it.
                  </Text>
                )
              }}
            />
          </Spacer>
        )}
        {salesChannels != null && (
          <Spacer top='6' bottom='4'>
            <HookedInputSelect
              name='clientId'
              label='Sales channel *'
              initialValues={
                // eslint-disable-next-line @typescript-eslint/naming-convention
                salesChannels?.map(({ client_id, name }) => ({
                  value: client_id,
                  label: name
                })) ?? undefined
              }
              pathToValue='value'
              hint={{
                text: <Text variant='info'>The sales channel to use.</Text>
              }}
            />
          </Spacer>
        )}
        {isAdvancedForm && (
          <Spacer top='6' bottom='4'>
            {!isLoading && (
              <RelationshipSelector
                fieldName='market'
                label='Market *'
                resourceType='markets'
                defaultResourceId={defaultValues?.market}
                filters={{
                  customer_group_null: true,
                  private_true: false,
                  disabled_at_null: true
                }}
              />
            )}

            {stockLocations != null && stockLocations.length >= 2 && (
              <Spacer top='2'>
                <HookedInputSelect
                  name='stockLocation'
                  label={undefined}
                  initialValues={[
                    defaultStockLocation,
                    ...(stockLocations != null
                      ? stockLocations?.map(({ id, name }) => ({
                          value: id,
                          label: name
                        }))
                      : [])
                  ]}
                  pathToValue='value'
                />
              </Spacer>
            )}
            <Spacer top='2'>
              <Hint>
                <Text variant='info'>
                  Select a market and restrict to a stock location if available.
                </Text>
              </Hint>
            </Spacer>
          </Spacer>
        )}
        <Spacer top='6' bottom='12'>
          <Grid columns={isAdvancedForm ? '2' : '1'} alignItems='end'>
            {isAdvancedForm && (
              <HookedInputDate
                name='startsAt'
                label='Start date *'
                showTimeSelect
                hint={{
                  text: (
                    <Text variant='info'>
                      The date the link will start working.
                    </Text>
                  )
                }}
              />
            )}
            <HookedInputDate
              name='expiresAt'
              label='Expiration date *'
              showTimeSelect
              hint={{
                text: (
                  <Text variant='info'>
                    The date the link will stop working.
                  </Text>
                )
              }}
            />
          </Grid>
        </Spacer>
        <Spacer top='14'>
          <Button
            type='submit'
            disabled={isSubmitting || isLoading}
            className='w-full'
          >
            {defaultValues?.id == null ? 'Generate' : 'Update'}
          </Button>
          <Spacer top='2'>
            <HookedValidationApiError apiError={apiError} />
          </Spacer>
        </Spacer>
      </HookedForm>
    </SkeletonTemplate>
  )
}
