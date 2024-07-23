import { ImportPreview } from '#components/ImportPreview'
import { InputCode } from '#components/InputCode'
import { InputParser } from '#components/InputParser'
import { ResourceFinder } from '#components/ResourceFinder'
import { getParentResourceIfNeeded, isAvailableResource } from '#data/resources'
import { appRoutes } from '#data/routes'
import { validateParentResource } from '#utils/validateParentResource'
import {
  Button,
  EmptyState,
  InputFeedback,
  PageError,
  PageLayout,
  Spacer,
  Tab,
  Tabs,
  formatResourceName,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { CommerceLayerStatic, type ImportCreate } from '@commercelayer/sdk'
import { type AllowedResourceType } from 'App'
import { unparse } from 'papaparse'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

function NewImportPage(): JSX.Element {
  const {
    canUser,
    settings: { mode }
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

      await sdkClient.imports.create({
        resource_type: resourceType,
        parent_resource_id: parentResourceId,
        format,
        inputs:
          format === 'csv'
            ? // This forced cast need to be removed once sdk updates input type to accept string values
              (unparse(importCreateValue) as unknown as object[])
            : importCreateValue
      })
      setLocation(appRoutes.list.makePath())
    } catch (e) {
      const errorMessage = CommerceLayerStatic.isApiError(e)
        ? e.errors.map(({ detail }) => detail).join(', ')
        : 'Could not create import'
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
        <Tabs id='tab-import-input' keepAlive>
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
        </Tabs>
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
