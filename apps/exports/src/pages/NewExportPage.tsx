import { Form } from '#components/Form'
import { adaptFormFiltersToSdk } from '#components/Form/Filters/utils'
import { validateRecordsCount } from '#components/Form/validateRecordsCount'
import { isAvailableResource, showResourceNiceName } from '#data/resources'
import { appRoutes } from '#data/routes'
import { parseApiError } from '#utils/apiErrors'
import {
  Button,
  EmptyState,
  InputFeedback,
  PageError,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type ApiError } from 'App'
import { type AllFilters, type ExportFormValues } from 'AppForm'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'
import { getUserDomain } from '../../../../packages/common/src/helpers/userUtils'

const NewExportPage = (): JSX.Element | null => {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()

  const [_match, params] = useRoute<{ resourceType?: string }>(
    appRoutes.newExport.path
  )
  const [_location, setLocation] = useLocation()

  const [apiError, setApiError] = useState<ApiError[] | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [shippingCategoryId, setShippingCategoryId] = useState<string>()
  const defaultValues: ExportFormValues = {
    dryData: true,
    format: 'csv',
    includes: []
  }

  const resourceType = params?.resourceType
  if (!isAvailableResource(resourceType)) {
    return <PageError errorName='Invalid resource' errorDescription='' />
  }

  useEffect(() => {
    const shipingCategoryProcess = async (): Promise<void> => {
      const list = await sdkClient.shipping_categories.list({
        sort: { created_at: 'desc' },
        filters: {
          metadata_jcont: {
            domain: getUserDomain() ?? ''
          }
        }
      })
      setShippingCategoryId(list?.[0]?.id ?? null)
    }

    void shipingCategoryProcess()
  }, [])

  const getDefaultValues = useCallback((): ExportFormValues => {
    if (shippingCategoryId !== null && shippingCategoryId !== undefined) {
      let categoryfilter: AllFilters | null = null

      if (resourceType === 'skus') {
        categoryfilter = {
          shipping_category_id_eq: shippingCategoryId
        }
      }

      if (resourceType === 'prices') {
        categoryfilter = {
          sku_shipping_category_id_eq: shippingCategoryId
        }
      }

      if (resourceType === 'stock_items') {
        categoryfilter = {
          sku_shipping_category_id_eq: shippingCategoryId
        }
      }

      if (categoryfilter != null) {
        return { ...defaultValues, filters: categoryfilter }
      }
    }
    return defaultValues
  }, [shippingCategoryId])

  if (!canUser('create', 'exports')) {
    return (
      <PageLayout
        title='Exports'
        mode={mode}
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(appRoutes.list.makePath())
          }
        }}
      >
        <EmptyState
          title='You are not authorized'
          action={
            <Link href={appRoutes.list.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const createExportTask = async (values: ExportFormValues): Promise<void> => {
    setApiError(undefined)
    setIsLoading(true)

    try {
      const filters = adaptFormFiltersToSdk(values.filters, user?.timezone)
      await validateRecordsCount({
        sdkClient,
        resourceType,
        filters
      })
      await sdkClient.exports.create({
        resource_type: resourceType,
        dry_data: values.dryData,
        includes: values.includes,
        format: values.format,
        filters,
        metadata: { email: user?.email ?? '' }
      })
      setLocation(appRoutes.list.makePath())
    } catch (error) {
      setApiError(parseApiError(error))
      setIsLoading(false)
    }
  }

  const hasApiError = apiError != null && apiError.length > 0

  return (
    <PageLayout
      title={`Export ${showResourceNiceName(resourceType).toLowerCase()}`}
      mode={mode}
      navigationButton={{
        label: 'Select type',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(appRoutes.selectResource.makePath())
        }
      }}
      overlay
    >
      <Spacer bottom='14'>
        <Form
          resourceType={resourceType}
          isLoading={isLoading}
          defaultValues={getDefaultValues()}
          onSubmit={(values) => {
            void createExportTask(values)
          }}
        />
        {hasApiError ? (
          <Spacer top='2'>
            {apiError.map((error, idx) => (
              <InputFeedback
                variant='danger'
                key={idx}
                message={error.detail}
              />
            ))}
          </Spacer>
        ) : null}
      </Spacer>
    </PageLayout>
  )
}

export default NewExportPage
