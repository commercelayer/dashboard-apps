import {
  Button,
  EmptyState,
  Icon,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  Section,
  SkeletonTemplate,
  Spacer,
  Tab,
  Tabs,
  Text,
  goBack,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { LinkListTable } from 'dashboard-apps-common/src/components/LinkListTable'

import { SkuDescription } from '#components/SkuDescription'
import { SkuInfo } from '#components/SkuInfo'
import { appRoutes } from '#data/routes'
import { useSkuDetails } from '#hooks/useSkuDetails'
import { isMockedId } from '#mocks'
import { useState, type FC } from 'react'

export const SkuDetails: FC = () => {
  const {
    settings: { mode, extras },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ skuId: string }>(appRoutes.details.path)

  const skuId = params?.skuId ?? ''

  const { sku, isLoading, error } = useSkuDetails(skuId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const [isDeleting, setIsDeleting] = useState(false)

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

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  const showLinks =
    extras?.salesChannels != null && extras?.salesChannels.length > 0

  if (canUser('update', 'skus')) {
    pageToolbar.buttons?.push({
      label: 'Edit',
      size: 'small',
      variant: 'secondary',
      onClick: () => {
        setLocation(appRoutes.edit.makePath({ skuId }))
      }
    })
  }

  if (canUser('destroy', 'skus')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Delete',
        onClick: () => {
          open()
        }
      }
    ])
  }

  const linkListTable = showLinks
    ? LinkListTable({ resourceId: skuId, resourceType: 'skus' })
    : null

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
      toolbar={pageToolbar}
      scrollToTop
      gap='only-top'
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          <Spacer top='14'>
            <SkuDescription sku={sku} />
          </Spacer>
          <Spacer top='14'>
            <Tabs keepAlive>
              <Tab name='Info'>
                <Spacer top='10'>
                  <SkuInfo sku={sku} />
                </Spacer>
                <Spacer top='14'>
                  <ResourceDetails resource={sku} />
                </Spacer>
                {!isMockedId(sku.id) && (
                  <>
                    <Spacer top='14'>
                      <ResourceTags
                        resourceType='skus'
                        resourceId={sku.id}
                        overlay={{ title: pageTitle }}
                        onTagClick={(tagId) => {
                          setLocation(
                            appRoutes.list.makePath({}, `tags_id_in=${tagId}`)
                          )
                        }}
                      />
                    </Spacer>
                    <Spacer top='14'>
                      <ResourceMetadata
                        resourceType='skus'
                        resourceId={sku.id}
                        overlay={{
                          title: pageTitle
                        }}
                      />
                    </Spacer>
                  </>
                )}
              </Tab>
              {showLinks ? (
                <Tab name='Links'>
                  <Spacer top='10'>
                    <Section
                      title='Links'
                      border={linkListTable != null ? 'none' : undefined}
                      actionButton={
                        canUser('update', 'skus') &&
                        showLinks && (
                          <Button
                            size='mini'
                            variant='secondary'
                            alignItems='center'
                            onClick={() => {
                              setLocation(
                                appRoutes.linksNew.makePath({
                                  resourceId: skuId
                                })
                              )
                            }}
                          >
                            <Icon name='lightning' size={16} />
                            New link
                          </Button>
                        )
                      }
                    >
                      {linkListTable ?? (
                        <Spacer top='4'>
                          <Text variant='info'>No items.</Text>
                        </Spacer>
                      )}
                    </Section>
                  </Spacer>
                </Tab>
              ) : null}
            </Tabs>
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
      {canUser('destroy', 'skus') && (
        <Overlay backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to delete the ${sku.code} (${sku.name}) SKU.`}
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
              disabled={isDeleting}
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
    </PageLayout>
  )
}
