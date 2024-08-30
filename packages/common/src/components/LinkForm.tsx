import {
  Button,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputDate,
  HookedInputSelect,
  HookedValidationApiError,
  SkeletonTemplate,
  Spacer,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { useMarketsList } from '../hooks/useMarketsList'

const linkFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  clientId: z.string().min(1),
  market: z.string().min(1),
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
}: Props): JSX.Element {
  const linkFormMethods = useForm<LinkFormValues>({
    defaultValues,
    resolver: zodResolver(linkFormSchema)
  })
  const { settings } = useTokenProvider()
  const salesChannels = settings.extras?.salesChannels

  const { markets, isLoading: isLoadingMarkets } = useMarketsList({})
  const isLoading = markets == null || isLoadingMarkets

  const isAdvancedForm = resourceType !== 'orders'

  // Set creation form defaults for advanced forms
  useEffect(() => {
    if (isAdvancedForm && !isLoading && defaultValues == null) {
      if (salesChannels != null && salesChannels.length > 0) {
        linkFormMethods.setValue('clientId', salesChannels[0]?.client_id ?? '')
      }
      if (markets != null && markets.length === 1) {
        linkFormMethods.setValue('market', markets[0]?.id ?? '')
      }
      linkFormMethods.setValue('startsAt', new Date())
    }
  }, [
    resourceType,
    isLoading,
    defaultValues,
    salesChannels,
    markets,
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
                text: <Text variant='info'>The sales channel to use</Text>
              }}
            />
          </Spacer>
        )}
        {isAdvancedForm && (
          <Spacer top='6' bottom='4'>
            {!isLoading && (
              <HookedInputSelect
                name='market'
                label='Market *'
                initialValues={markets?.map(({ id, name }) => ({
                  value: id,
                  label: name
                }))}
                pathToValue='value'
                hint={{
                  text: <Text variant='info'>The market to use</Text>
                }}
              />
            )}
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
