import {
  Button,
  CodeBlock,
  EmptyState,
  PageLayout,
  Section,
  SkeletonTemplate,
  Spacer,
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
  const { skuListItems, isLoadingItems } = useSkuListItems(skuListId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const [isDeleteting, setIsDeleting] = useState(false)

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

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'sku_lists')) {
    pageToolbar.buttons?.push({
      label: 'Edit',
      size: 'small',
      onClick: () => {
        setLocation(appRoutes.edit.makePath({ skuListId }))
      }
    })
    if (extras?.salesChannels != null && extras?.salesChannels.length > 0) {
      pageToolbar.buttons?.push({
        label: 'Create link',
        icon: 'shoppingBagOpen',
        size: 'small',
        variant: 'secondary',
        onClick: () => {
          setLocation(appRoutes.linksNew.makePath({ resourceId: skuListId }))
        }
      })
    }
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
        <Spacer top='12' bottom='4'>
          <Section title='Items'>
            {skuList.manual === true ? (
              <>
                {skuListItems != null
                  ? skuListItems.map((item) => (
                      <ListItemSkuListItem
                        key={item.sku_code}
                        resource={item}
                      />
                    ))
                  : null}
              </>
            ) : (
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
          </Section>
        </Spacer>
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
              disabled={isDeleteting}
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
