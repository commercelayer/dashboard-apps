import {
  Button,
  EmptyState,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  goBack,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { BundleDescription } from '#components/BundleDescription'
import { BundleInfo } from '#components/BundleInfo'
import { BundleSkuList } from '#components/BundleSkuList'
import { appRoutes } from '#data/routes'
import { useBundleDetails } from '#hooks/useBundleDetails'
import { isMockedId } from '#mocks'
import { useState, type FC } from 'react'

export const BundleDetails: FC = () => {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ bundleId: string }>(appRoutes.details.path)

  const bundleId = params?.bundleId ?? ''
  const goBackUrl = appRoutes.list.makePath({})

  const { bundle, isLoading, error } = useBundleDetails(bundleId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay: DeleteOverlay, open, close } = useOverlay()
  const [isDeleting, setIsDeleting] = useState(false)

  const pageTitle = bundle.name ?? 'Bundles'

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'bundles')) {
    pageToolbar.buttons?.push({
      label: 'Edit',
      size: 'small',
      variant: 'secondary',
      onClick: () => {
        setLocation(appRoutes.edit.makePath({ bundleId }))
      }
    })
  }

  if (canUser('destroy', 'bundles')) {
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
      description={
        <SkeletonTemplate isLoading={isLoading}>{bundle.code}</SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.list.makePath({})
          })
        },
        label: 'Bundles',
        icon: 'arrowLeft'
      }}
      toolbar={pageToolbar}
      scrollToTop
      gap='only-top'
    >
      {error != null ? (
        <EmptyState
          title='Not authorized'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      ) : (
        <>
          <SkeletonTemplate isLoading={isLoading}>
            <Spacer bottom='4'>
              <Spacer top='14'>
                <BundleDescription bundle={bundle} />
              </Spacer>
              <Spacer top='14'>
                <BundleSkuList bundle={bundle} />
              </Spacer>
              <Spacer top='14'>
                <BundleInfo bundle={bundle} />
              </Spacer>
              <Spacer top='14'>
                <ResourceDetails resource={bundle} />
              </Spacer>
              {!isMockedId(bundle.id) && (
                <>
                  <Spacer top='14'>
                    <ResourceTags
                      resourceType='bundles'
                      resourceId={bundle.id}
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
                      resourceType='bundles'
                      resourceId={bundle.id}
                      overlay={{
                        title: pageTitle
                      }}
                    />
                  </Spacer>
                </>
              )}
            </Spacer>
          </SkeletonTemplate>
          {canUser('destroy', 'bundles') && (
            <DeleteOverlay backgroundColor='light'>
              <PageLayout
                title={`Confirm that you want to delete the ${bundle.code} (${bundle.name}) bundle.`}
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
                    void sdkClient.bundles
                      .delete(bundle.id)
                      .then(() => {
                        setLocation(appRoutes.list.makePath({}))
                      })
                      .catch(() => {})
                  }}
                  fullWidth
                >
                  Delete bundle
                </Button>
              </PageLayout>
            </DeleteOverlay>
          )}
        </>
      )}
    </PageLayout>
  )
}
