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
  useAppLinking,
  useCoreApi,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { SkuInfo } from '#components/SkuInfo'
import { appRoutes } from '#data/routes'
import { useSkuDeleteOverlay } from '#hooks/useSkuDeleteOverlay'
import { useSkuDetails } from '#hooks/useSkuDetails'
import { isMockedId } from '@commercelayer/app-elements'
import { LinkListTable } from 'dashboard-apps-common/src/components/LinkListTable'
import { LinksEmptyState } from 'dashboard-apps-common/src/components/LinksEmptyState'
import { SkuDescription } from 'dashboard-apps-common/src/components/SkuDescription'
import { type FC } from 'react'
import { useSearch } from 'wouter/use-browser-location'

export const SkuDetails: FC = () => {
  const {
    settings: { mode, extras },
    canUser
  } = useTokenProvider()
  const { goBack } = useAppLinking()

  const queryString = useSearch()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ skuId: string }>(appRoutes.details.path)

  const skuId = params?.skuId ?? ''

  const { sku, isLoading, error, mutateSku } = useSkuDetails(skuId)

  const { Overlay: SkuDeleteOverlay, show } = useSkuDeleteOverlay(sku)

  const hasSalesChannels =
    extras?.salesChannels != null && extras?.salesChannels.length > 0

  const { data: publicMarkets } = useCoreApi(
    'markets',
    'list',
    [
      {
        fields: ['id'],
        filters: {
          customer_group_null: true,
          private_true: false,
          disabled_at_null: true
        },
        pageSize: 1
      }
    ],
    {}
  )
  const hasPublicMarkets =
    publicMarkets != null && publicMarkets.meta.recordCount > 0

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
          show()
        }
      }
    ])
  }

  const tabs = ['info', 'links']
  const urlParams = new URLSearchParams(queryString)
  const defaultTab =
    urlParams.get('tab') != null
      ? (tabs.findIndex((t) => t === urlParams.get('tab')) ?? 0)
      : 0

  const SkuInfos = (
    <>
      <Spacer top='10'>
        <SkuInfo sku={sku} />
      </Spacer>
      <Spacer top='14'>
        <ResourceDetails
          resource={sku}
          onUpdated={async () => {
            void mutateSku()
          }}
        />
      </Spacer>
      {!isMockedId(sku.id) && (
        <>
          <Spacer top='14'>
            <ResourceTags
              resourceType='skus'
              resourceId={sku.id}
              overlay={{ title: pageTitle }}
              onTagClick={(tagId) => {
                setLocation(appRoutes.list.makePath({}, `tags_id_in=${tagId}`))
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
    </>
  )

  const SkuTabs = (
    <Tabs keepAlive defaultTab={defaultTab}>
      <Tab name='Info'>{SkuInfos}</Tab>
      <Tab name='Links'>
        <Spacer top='10'>
          <Section
            title='Links'
            border={hasSalesChannels && hasPublicMarkets ? 'none' : undefined}
            actionButton={
              canUser('update', 'skus') &&
              hasSalesChannels &&
              hasPublicMarkets && (
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
            {hasSalesChannels && hasPublicMarkets ? (
              <LinkListTable resourceId={skuId} resourceType='skus' />
            ) : (
              <LinksEmptyState
                scope={
                  !hasSalesChannels
                    ? 'no-sales-channels'
                    : !hasPublicMarkets
                      ? 'no-public-markets'
                      : 'no-links'
                }
                resourceId={skuId}
                resourceType='skus'
              />
            )}
          </Section>
        </Spacer>
      </Tab>
    </Tabs>
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
            currentResourceId: skuId,
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
            <SkuDescription resource={sku} />
          </Spacer>
          <Spacer top='14'>{SkuTabs}</Spacer>
        </Spacer>
      </SkeletonTemplate>
      <SkuDeleteOverlay />
    </PageLayout>
  )
}
