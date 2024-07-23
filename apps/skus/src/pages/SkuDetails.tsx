import {
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  EmptyState,
  Icon,
  PageLayout,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  goBack,
  useCoreSdkProvider,
  useEditMetadataOverlay,
  useOverlay,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { SkuDescription } from '#components/SkuDescription'
import { SkuInfo } from '#components/SkuInfo'
import { appRoutes } from '#data/routes'
import { useSkuDetails } from '#hooks/useSkuDetails'
import { isMockedId } from '#mocks'
import { useState, type FC } from 'react'

export const SkuDetails: FC = () => {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ skuId: string }>(appRoutes.details.path)

  const skuId = params?.skuId ?? ''

  const { sku, isLoading, error } = useSkuDetails(skuId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const [isDeleteting, setIsDeleting] = useState(false)

  const { Overlay: EditMetadataOverlay, show: showEditMetadataOverlay } =
    useEditMetadataOverlay()

  if (error != null) {
    return (
      <PageLayout
        title='Skus'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: 'SKUs',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = sku.name

  const contextMenuEdit = canUser('update', 'skus') && (
    <>
      <DropdownItem
        label='Edit'
        onClick={() => {
          setLocation(appRoutes.edit.makePath({ skuId }))
        }}
      />
      <DropdownItem
        label='Set metadata'
        onClick={() => {
          showEditMetadataOverlay()
        }}
      />
    </>
  )

  const contextMenuDivider = canUser('update', 'skus') &&
    canUser('destroy', 'skus') && <DropdownDivider />

  const contextMenuDelete = canUser('destroy', 'skus') && (
    <DropdownItem
      label='Delete'
      onClick={() => {
        open()
      }}
    />
  )

  const contextMenu = (
    <Dropdown
      dropdownLabel={
        <Button variant='secondary' size='small'>
          <Icon name='dotsThree' size={16} weight='bold' />
        </Button>
      }
      dropdownItems={
        <>
          {contextMenuEdit}
          {contextMenuDivider}
          {contextMenuDelete}
        </>
      }
    />
  )

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>{sku.code}</SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.list.makePath({})
          })
        },
        label: 'SKUs',
        icon: 'arrowLeft'
      }}
      actionButton={contextMenu}
      scrollToTop
      gap='only-top'
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          {!isMockedId(sku.id) && (
            <Spacer top='6'>
              <ResourceTags
                resourceType='skus'
                resourceId={sku.id}
                overlay={{ title: 'Edit tags', description: pageTitle }}
                onTagClick={(tagId) => {
                  setLocation(
                    appRoutes.list.makePath({}, `tags_id_in=${tagId}`)
                  )
                }}
              />
            </Spacer>
          )}
          <Spacer top='14'>
            <SkuDescription sku={sku} />
          </Spacer>
          <Spacer top='14'>
            <SkuInfo sku={sku} />
          </Spacer>
          {!isMockedId(sku.id) && (
            <Spacer top='14'>
              <ResourceMetadata
                resourceType='skus'
                resourceId={sku.id}
                overlay={{
                  title: sku.name,
                  description: sku.code
                }}
              />
            </Spacer>
          )}
        </Spacer>
      </SkeletonTemplate>
      {canUser('destroy', 'skus') && (
        <Overlay backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to cancel the ${sku.code} (${sku.name}) SKU.`}
            description='This action cannot be undone, proceed with caution.'
            minHeight={false}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: `Cancel`,
              icon: 'x'
            }}
          >
            <Button
              variant='danger'
              size='small'
              disabled={isDeleteting}
              onClick={(e) => {
                setIsDeleting(true)
                e.stopPropagation()
                void sdkClient.skus
                  .delete(sku.id)
                  .then(() => {
                    setLocation(appRoutes.list.makePath({}))
                  })
                  .catch(() => {})
              }}
              fullWidth
            >
              Delete SKU
            </Button>
          </PageLayout>
        </Overlay>
      )}
      {!isMockedId(sku.id) && (
        <EditMetadataOverlay
          resourceType={sku.type}
          resourceId={sku.id}
          title={sku.name}
          description={sku.code}
        />
      )}
    </PageLayout>
  )
}
