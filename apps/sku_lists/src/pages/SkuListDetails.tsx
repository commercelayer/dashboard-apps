import {
  Alert,
  Button,
  CodeBlock,
  EmptyState,
  Icon,
  PageLayout,
  Section,
  SkeletonTemplate,
  Spacer,
  Text,
  goBack,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

import { ListItemSkuListItem } from '#components/ListItemSkuListItem'
import { appRoutes, type PageProps } from '#data/routes'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import { useSkuListItems } from '#hooks/useSkuListItems'
import { LinkListTable } from 'dashboard-apps-common/src/components/LinkListTable'
import { useState } from 'react'

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
  const { skuListItems, skuListItemsCount, isLoadingItems } =
    useSkuListItems(skuListId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const [isDeleting, setIsDeleting] = useState(false)

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
  const isManual =
    skuList?.manual === true && skuListItems != null && skuListItems.length > 0
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
          open()
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
      <SkeletonTemplate isLoading={isLoadingItems}>
        {hasBundles && (
          <Spacer top='12' bottom='4'>
            <Alert status='info'>
              Items in a SKU List linked to a Bundle cannot be modified.
            </Alert>
          </Spacer>
        )}
        <Spacer top='12' bottom='4'>
          <Section
            title={`Items · ${skuListItemsCount}`}
            actionButton={
              isManual &&
              Number(skuListItemsCount) > 5 && (
                <Button
                  variant='secondary'
                  size='mini'
                  onClick={() => {
                    setLocation(appRoutes.itemsList.makePath({ skuListId }))
                  }}
                  alignItems='center'
                >
                  <Icon name='eye' size={16} />
                  See all
                </Button>
              )
            }
          >
            {isManual ? (
              <>
                {skuListItems.map((item) => (
                  <ListItemSkuListItem key={item.sku_code} resource={item} />
                ))}
                {}
              </>
            ) : isAutomatic ? (
              <Spacer top='6'>
                <CodeBlock
                  hint={{
                    text: 'Matching SKU codes are automatically included to this list.'
                  }}
                >
                  {skuList.sku_code_regex ?? ''}
                </CodeBlock>
              </Spacer>
            ) : (
              <Spacer top='4'>
                <Text variant='info'>No items.</Text>
              </Spacer>
            )}
          </Section>
        </Spacer>
        {showLinks && (
          <Spacer top='12' bottom='4'>
            <Section
              title='Links'
              border={linkListTable != null ? 'none' : undefined}
            >
              {linkListTable ?? (
                <Spacer top='4'>
                  <Text variant='info'>No items.</Text>
                </Spacer>
              )}
            </Section>
          </Spacer>
        )}
      </SkeletonTemplate>
      {canUser('destroy', 'sku_lists') && (
        <Overlay backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to cancel the SKU list (${skuList?.name}).`}
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
                void sdkClient.sku_lists
                  .delete(skuList.id)
                  .then(() => {
                    setLocation(appRoutes.list.makePath({}))
                  })
                  .catch(() => {})
              }}
              fullWidth
            >
              Delete SKU list
            </Button>
          </PageLayout>
        </Overlay>
      )}
    </PageLayout>
  )
}
