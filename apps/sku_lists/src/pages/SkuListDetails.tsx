import {
  Alert,
  Button,
  CodeBlock,
  EmptyState,
  Icon,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  Section,
  SkeletonTemplate,
  Spacer,
  Tab,
  Tabs,
  Text,
  useAppLinking,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

import { SkuListManualItems } from '#components/SkuListManualItems'
import { appRoutes, type PageProps } from '#data/routes'
import { useSkuListDeleteOverlay } from '#hooks/useSkuListDeleteOverlay'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import { isMockedId } from '#mocks'
import { LinkListTable } from 'dashboard-apps-common/src/components/LinkListTable'
import { useSearch } from 'wouter/use-browser-location'

export const SkuListDetails = (
  props: PageProps<typeof appRoutes.details>
): JSX.Element => {
  const {
    settings: { mode, extras },
    canUser
  } = useTokenProvider()
  const { goBack } = useAppLinking()

  const [, setLocation] = useLocation()
  const skuListId = props.params?.skuListId ?? ''

  const { skuList, isLoading, error, mutateSkuList } =
    useSkuListDetails(skuListId)

  const { Overlay: DeleteOverlay, show: showDeleteOverlay } =
    useSkuListDeleteOverlay(skuList)

  if (error != null) {
    return (
      <PageLayout
        title={skuList?.name}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: 'SKU Lists',
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

  const pageTitle = skuList?.name
  const hasBundles = skuList?.bundles != null && skuList?.bundles.length > 0
  const isManual = skuList?.manual === true
  const isAutomatic =
    skuList?.manual === false && skuList.sku_code_regex != null

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  const showLinks =
    extras?.salesChannels != null && extras?.salesChannels.length > 0

  const tabs = ['items', ...(showLinks ? ['links'] : []), 'info']
  const queryString = useSearch()
  const urlParams = new URLSearchParams(queryString)
  const defaultTab =
    urlParams.get('tab') != null
      ? (tabs.findIndex((t) => t === urlParams.get('tab')) ?? 0)
      : 0

  if (canUser('update', 'sku_lists')) {
    pageToolbar.buttons?.push({
      label: 'Edit',
      size: 'small',
      variant: 'secondary',
      onClick: () => {
        setLocation(appRoutes.edit.makePath({ skuListId }))
      }
    })
  }

  if (canUser('destroy', 'sku_lists')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Delete',
        onClick: () => {
          showDeleteOverlay()
        }
      }
    ])
  }

  const linkListTable = showLinks
    ? LinkListTable({ resourceId: skuListId, resourceType: 'sku_lists' })
    : null

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            currentResourceId: skuListId,
            defaultRelativePath: appRoutes.list.makePath({})
          })
        },
        label: 'SKU Lists',
        icon: 'arrowLeft'
      }}
      toolbar={pageToolbar}
      scrollToTop
      gap='only-top'
    >
      <Spacer top='10' bottom='4'>
        <Tabs keepAlive defaultTab={defaultTab}>
          <Tab name='Items'>
            {isManual && (
              <>
                {hasBundles && (
                  <Spacer top='10' bottom='14'>
                    <Alert status='info'>
                      Items in a SKU List linked to a Bundle cannot be modified.
                    </Alert>
                  </Spacer>
                )}
                <SkuListManualItems
                  skuListId={skuListId}
                  hasBundles={hasBundles}
                />
              </>
            )}
            {isAutomatic && (
              <Spacer top='10'>
                <CodeBlock
                  hint={{
                    text: 'Matching SKU codes are automatically included to this list.'
                  }}
                >
                  {skuList.sku_code_regex ?? ''}
                </CodeBlock>
              </Spacer>
            )}
          </Tab>
          {showLinks ? (
            <Tab name='Links'>
              <Spacer top='10'>
                <Section
                  title='Links'
                  border={linkListTable != null ? 'none' : undefined}
                  actionButton={
                    showLinks && (
                      <Button
                        size='mini'
                        variant='secondary'
                        alignItems='center'
                        onClick={() => {
                          setLocation(
                            appRoutes.linksNew.makePath({
                              resourceId: skuListId
                            })
                          )
                        }}
                      >
                        <Icon name='lightning' size='16' />
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
          <Tab name='Info'>
            <Spacer top='10'>
              <ResourceDetails
                resource={skuList}
                onUpdated={async () => {
                  void mutateSkuList()
                }}
              />
            </Spacer>
            {!isMockedId(skuList.id) && (
              <Spacer top='14'>
                <ResourceMetadata
                  resourceType='sku_lists'
                  resourceId={skuList.id}
                  overlay={{
                    title: pageTitle
                  }}
                />
              </Spacer>
            )}
          </Tab>
        </Tabs>
      </Spacer>
      {canUser('destroy', 'sku_lists') && <DeleteOverlay />}
    </PageLayout>
  )
}
