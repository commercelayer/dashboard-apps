import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

import { appRoutes, type PageProps } from '#data/routes'
import { LinkListRow } from 'dashboard-apps-common/src/components/LinkListRow'
import { LinkListTable } from 'dashboard-apps-common/src/components/LinkListTable'
import { useLinksList } from 'dashboard-apps-common/src/hooks/useLinksList'

export const LinkList = (
  props: PageProps<typeof appRoutes.linksList>
): JSX.Element => {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const skuId = props.params?.skuId ?? ''
  const goBackUrl = appRoutes.details.makePath({ skuId })
  const {
    links,
    isLoading,
    error,
    mutate: mutateList
  } = useLinksList({ resourceId: skuId, resourceType: 'skus' })

  const pageTitle = 'Archive'

  return (
    <PageLayout
      mode={mode}
      title={pageTitle}
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: goBackUrl
          })
        },
        label: 'Cancel',
        icon: 'x'
      }}
      toolbar={
        canUser('create', 'links')
          ? {
              buttons: [
                {
                  label: 'Add new',
                  icon: 'plus',
                  size: 'small',
                  onClick: () => {
                    setLocation(appRoutes.linksNew.makePath({ skuId }))
                  }
                }
              ]
            }
          : undefined
      }
      scrollToTop
      overlay
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
        <SkeletonTemplate isLoading={isLoading}>
          <LinkListTable
            tableRows={links?.map((link) => (
              <LinkListRow
                link={link}
                onLinkDetailsClick={() => {
                  setLocation(
                    appRoutes.linksDetails.makePath({
                      skuId,
                      linkId: link.id
                    })
                  )
                }}
                onLinkEditClick={() => {
                  setLocation(
                    appRoutes.linksEdit.makePath({
                      skuId,
                      linkId: link.id
                    })
                  )
                }}
                key={link.id}
                mutateList={mutateList}
              />
            ))}
            isTableEmpty={!isLoading && links?.length === 0}
          />
        </SkeletonTemplate>
      )}
    </PageLayout>
  )
}
