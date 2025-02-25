import {
  A,
  Button,
  EmptyState,
  Icon,
  PageLayout,
  SkeletonTemplate,
  goBack,
  useCoreApi,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Link as ClayerLink } from '@commercelayer/sdk'
import { Link, useLocation } from 'wouter'
import { LinkDetailsCard } from '../components/LinkDetailsCard'
import { useLinkDetails } from '../hooks/useLinkDetails'

interface Props {
  linkId: ClayerLink['id']
  goBackUrl: string
}

export const LinkDetailsPage = ({
  linkId,
  goBackUrl
}: Props): React.JSX.Element => {
  const {
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()

  const { data: organization } = useCoreApi('organization', 'retrieve', [])

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
        label: 'Close',
        icon: 'x'
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
              <A
                variant='secondary'
                size='small'
                alignItems='center'
                target='_blank'
                href={link?.url ?? ''}
              >
                <Icon name='arrowSquareOut' size={16} />
                Open link
              </A>
            }
            share={{
              email: {
                subject: `A curated selection for you`,
                body: `Dear customer,
                        please find a curated selection for you:
                        ${link.url}
                        Thank you,
                        The ${organization?.name} team`.replace(/^\s+/gm, '')
              },
              whatsapp: {
                text: `Please find a curated selection for you: ${link.url}`
              }
            }}
            showQR
          />
        </SkeletonTemplate>
      )}
    </PageLayout>
  )
}
