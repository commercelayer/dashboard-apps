import {
  Button,
  EmptyState,
  Icon,
  PageLayout,
  SkeletonTemplate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Link as ClayerLink, Sku, SkuList } from '@commercelayer/sdk'
import { Link, useLocation } from 'wouter'
import { LinkDetailsCard } from '../components/LinkDetailsCard'
import { linksRoutes } from '../data/routes'
import { useLinkDetails } from '../hooks/useLinkDetails'

interface Props {
  resourceId: Sku['id'] | SkuList['id']
  linkId: ClayerLink['id']
}

export const LinkDetailsPage = ({ resourceId, linkId }: Props): JSX.Element => {
  const {
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()

  const goBackUrl = linksRoutes.linksList.makePath({ resourceId })
  const { link, isLoading, error } = useLinkDetails(linkId)

  const pageTitle = link?.name ?? 'Link'

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
            defaultRelativePath: goBackUrl
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      isLoading={isLoading}
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
          <LinkDetailsCard
            link={link}
            primaryAction={
              <Button
                variant='secondary'
                size='small'
                alignItems='center'
                onClick={() => {
                  goBack({
                    setLocation,
                    defaultRelativePath: goBackUrl
                  })
                }}
              >
                <Icon name='archive' size={16} />
                View archive
              </Button>
            }
            showQR
          />
        </SkeletonTemplate>
      )}
    </PageLayout>
  )
}
