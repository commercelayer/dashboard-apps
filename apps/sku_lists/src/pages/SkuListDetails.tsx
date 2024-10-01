import {
  Alert,
  Button,
  CodeBlock,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  Tab,
  Tabs,
  Text,
  goBack,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

import { SkuListManualItems } from '#components/SkuListManualItems'
import { appRoutes, type PageProps } from '#data/routes'
import { useSkuListDeleteOverlay } from '#hooks/useSkuListDeleteOverlay'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import { LinkListTable } from 'dashboard-apps-common/src/components/LinkListTable'

export const SkuListDetails = (
  props: PageProps<typeof appRoutes.details>
): JSX.Element => {
  const {
    settings: { mode, extras },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const skuListId = props.params?.skuListId ?? ''

  const { skuList, isLoading, error } = useSkuListDetails(skuListId)

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

  if (canUser('update', 'sku_lists')) {
    if (showLinks) {
      pageToolbar.buttons?.push({
        label: 'New link',
        icon: 'lightning',
        size: 'small',
        variant: 'secondary',
        onClick: () => {
          setLocation(appRoutes.linksNew.makePath({ resourceId: skuListId }))
        }
      })
    }

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
            setLocation,
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
      {hasBundles && (
        <Spacer top='12' bottom='4'>
          <Alert status='info'>
            Items in a SKU List linked to a Bundle cannot be modified.
          </Alert>
        </Spacer>
      )}
      <Spacer top='12' bottom='4'>
        <Tabs keepAlive>
          <Tab name='Items'>
            {isManual && (
              <SkuListManualItems
                skuListId={skuListId}
                hasBundles={hasBundles}
              />
            )}
            {isAutomatic && (
              <Spacer top='6'>
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
            <>
              {linkListTable ?? (
                <Spacer top='4'>
                  <Text variant='info'>No items.</Text>
                </Spacer>
              )}
            </>
          ) : null}
          <Tab name='Info'>INFO</Tab>
        </Tabs>
      </Spacer>
      {canUser('destroy', 'sku_lists') && <DeleteOverlay />}
    </PageLayout>
  )
}
