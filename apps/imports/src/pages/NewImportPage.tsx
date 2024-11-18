import { ImportPreview } from '#components/ImportPreview'
import { InputParser } from '#components/InputParser'
import { ResourceFinder } from '#components/ResourceFinder'
import { getParentResourceIfNeeded, isAvailableResource } from '#data/resources'
import { appRoutes } from '#data/routes'
import { sleep } from '#utils/sleep'
import { validateParentResource } from '#utils/validateParentResource'
import {
  Button,
  EmptyState,
  InputFeedback,
  PageError,
  PageLayout,
  Spacer,
  Tab,
  formatResourceName,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer, {
  CommerceLayerStatic,
  type ImportCreate
} from '@commercelayer/sdk'
import { type AllowedResourceType } from 'App'
import {
  getUserDomain,
  isAdmin
} from 'dashboard-apps-common/src/utils/userUtils'
import { unparse } from 'papaparse'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

function NewImportPage(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()

  const [_match, params] = useRoute<{ resourceType?: AllowedResourceType }>(
    appRoutes.newImport.path
  )
  const [_location, setLocation] = useLocation()

  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | undefined>()
  const [parentResourceId, setParentResourceId] = useState<string | null>()
  const [format, setFormat] = useState<'csv' | 'json'>()
  const [importCreateValue, setImportCreateValue] = useState<
    ImportCreate['inputs'] | undefined
  >(undefined)

  if (!canUser('create', 'imports')) {
    return (
      <PageLayout
        title='Imports'
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

  const resourceType = params?.resourceType

  if (resourceType == null) {
    return <PageError errorName='Missing param' errorDescription='' />
  }

  if (!isAvailableResource(resourceType)) {
    return (
      <PageError
        errorName='Invalid resource type'
        errorDescription='Resource not allowed or not enabled'
        actionButton={
          <Link href={appRoutes.list.makePath()}>
            <Button variant='primary'>Go back</Button>
          </Link>
        }
      />
    )
  }

  async function validateShippingCategory(): Promise<void> {
    if (importCreateValue == null) {
      throw new Error(`No values to import`)
    }

    // Allow the Vanti and Aplyca users to import SKUs with any shipping category
    if (isAdmin(user, import.meta.env.PUBLIC_TEST_USERS)) {
      return
    }

    const auth = await authenticate('client_credentials', {
      clientId:
        (mode === 'live'
          ? import.meta.env.PUBLIC_LIVE_READ_CLIENT_ID
          : import.meta.env.PUBLIC_TEST_READ_CLIENT_ID) ?? '',
      clientSecret:
        mode === 'live'
          ? import.meta.env.PUBLIC_LIVE_READ_CLIENT_SECRET
          : import.meta.env.PUBLIC_TEST_READ_CLIENT_SECRET
    })

    const integrationClient = CommerceLayer({
      organization: 'vanti-poc',
      accessToken: auth.accessToken
    })

    const list = await integrationClient.shipping_categories.list({
      sort: { created_at: 'desc' },
      filters: {
        metadata_jcont: {
          domain: getUserDomain(user, import.meta.env.PUBLIC_TEST_USERS) ?? ''
        }
      }
    })

    const shippingCategoryId = list?.[0]?.id ?? null

    if (shippingCategoryId === null || shippingCategoryId === undefined) {
      throw new Error(
        'You do not have the necessary permissions to perform the import. Please contact the administrator.'
      )
    }

    const shippingCategoryName = list?.[0]?.name ?? null

    if (resourceType === 'skus') {
      if (
        importCreateValue.filter(
          (sku: any) => sku?.shipping_category_id !== shippingCategoryId
        ).length > 0
      ) {
        throw new Error(
          `You can only import SKUs with the shipping category: ${shippingCategoryName}`
        )
      }
    } else if (resourceType === 'prices' || resourceType === 'stock_items') {
      const uniqueSkuCodes = [
        ...new Set(importCreateValue.map((item) => item.sku_code))
      ]
      const batches = []
      for (let i = 0; i < uniqueSkuCodes.length; i += 25) {
        batches.push(uniqueSkuCodes.slice(i, i + 25))
      }

      for (const batch of batches) {
        const skuCodeString = batch.join(',')
        await sleep(30)
        const skuBatch = await integrationClient.skus.list({
          filters: { code_in: skuCodeString },
          include: ['shipping_category'],
          pageSize: 25
        })

        if (
          skuBatch.filter(
            (price: any) => price?.shipping_category?.id !== shippingCategoryId
          ).length > 0
        ) {
          throw new Error(
            `You can only import ${formatResourceName({
              resource: resourceType,
              count: 'plural',
              format: 'lower'
            })} of SKUs with the shipping category: ${shippingCategoryName}`
          )
        }
      }
    }
  }

  const createImportTask = async (
    selectedParentResourceId?: string
  ): Promise<void> => {
    if (importCreateValue == null) {
      return
    }

    setApiError(undefined)
    setIsLoading(true)
    try {
      const parentResourceId = await validateParentResource({
        sdkClient,
        resourceType,
        parentResourceId: selectedParentResourceId
      })

      await validateShippingCategory()

      await sdkClient.imports.create({
        resource_type: resourceType,
        parent_resource_id: parentResourceId,
        format,
        inputs:
          format === 'csv'
            ? // This forced cast need to be removed once sdk updates input type to accept string values
              (unparse(importCreateValue) as unknown as object[])
            : importCreateValue,
        metadata: { email: user?.email ?? '' }
      })
      setLocation(appRoutes.list.makePath())
    } catch (e) {
      const errorMessage = CommerceLayerStatic.isApiError(e)
        ? e.errors.map(({ detail }) => detail).join(', ')
        : e?.toString()
      setApiError(errorMessage)
      setIsLoading(false)
    }
  }

  const parentResource = getParentResourceIfNeeded(resourceType)
  const canCreateImport =
    importCreateValue != null && importCreateValue.length > 0

  return (
    <PageLayout
      title={`Import ${formatResourceName({
        resource: resourceType,
        count: 'plural'
      })}`}
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
      {parentResource !== false && (
        <Spacer bottom='14'>
          <ResourceFinder
            label={formatResourceName({
              resource: parentResource,
              count: 'plural',
              format: 'title'
            })}
            placeholder='Type to search parent resource'
            resourceType={parentResource}
            sdkClient={sdkClient}
            onSelect={setParentResourceId}
            hint={{
              text: 'Required when creating new records. Can also be specified in the import data, for each single record.'
            }}
          />
        </Spacer>
      )}

      <Spacer bottom='14'>
        <Tab name='Upload file'>
          <InputParser
            resourceType={resourceType}
            onDataReady={(input, format) => {
              setImportCreateValue(input)
              setFormat(format)
            }}
            onDataResetRequest={() => {
              setImportCreateValue(undefined)
            }}
            hasParentResource={Boolean(parentResource)}
          />
        </Tab>
        {/* <Tabs id='tab-import-input' keepAlive>
          <Tab name='Upload file'>
            <InputParser
              resourceType={resourceType}
              onDataReady={(input, format) => {
                setImportCreateValue(input)
                setFormat(format)
              }}
              onDataResetRequest={() => {
                setImportCreateValue(undefined)
              }}
              hasParentResource={Boolean(parentResource)}
            />
          </Tab>
          <Tab name='Paste code'>
            <InputCode
              onDataReady={(input) => {
                setImportCreateValue(input)
                setFormat('json')
              }}
              onDataResetRequest={() => {
                setImportCreateValue(undefined)
              }}
            />
          </Tab>
        </Tabs> */}
      </Spacer>

      {importCreateValue != null && importCreateValue.length > 0 ? (
        <Spacer bottom='14'>
          <ImportPreview
            title='Preview'
            data={importCreateValue as []}
            limit={5}
          />
        </Spacer>
      ) : null}

      <Spacer bottom='14'>
        <Button
          variant='primary'
          onClick={() => {
            if (!canCreateImport) {
              return
            }
            void createImportTask(parentResourceId ?? undefined)
          }}
          disabled={isLoading}
        >
          {isLoading
            ? 'Importing...'
            : `Import ${formatResourceName({
                resource: resourceType,
                count: 'plural',
                format: 'lower'
              })}`}
        </Button>
        {apiError != null ? (
          <InputFeedback variant='danger' message={apiError} />
        ) : null}
      </Spacer>
    </PageLayout>
  )
}

export default NewImportPage
