import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Sku, SkuList } from '@commercelayer/sdk'
import { Link, useLocation } from 'wouter'
import { LinkListRow } from '../components/LinkListRow'
import { LinkListTable } from '../components/LinkListTable'
import { linksRoutes } from '../data/routes'
import { useLinksList } from '../hooks/useLinksList'

interface Props {
  resourceId: Sku['id'] | SkuList['id']
  resourceType: 'skus' | 'sku_lists'
  goBackUrl: string
}

export const LinksArchivePage = ({
  resourceId,
  resourceType,
  goBackUrl
}: Props): JSX.Element => {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()

  const {
    links,
    isLoading,
    error,
    mutate: mutateList
  } = useLinksList({ resourceId, resourceType })

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
                    setLocation(linksRoutes.linksNew.makePath({ resourceId }))
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
                    linksRoutes.linksDetails.makePath({
                      resourceId,
                      linkId: link.id
                    })
                  )
                }}
                onLinkEditClick={() => {
                  setLocation(
                    linksRoutes.linksEdit.makePath({
                      resourceId,
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
