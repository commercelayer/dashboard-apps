import {
  A,
  Icon,
  PageLayout,
  SkeletonTemplate,
  formatDate,
  useAppLinking,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

import { appRoutes, type PageProps } from '#data/routes'
import { useGetCheckoutLink } from '#hooks/useGetCheckoutLink'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { LinkDetailsCard } from 'dashboard-apps-common/src/components/LinkDetailsCard'
import { useMemo } from 'react'

function phoneNumberForWhatsapp(
  phoneNumber?: string | null
): string | undefined | null {
  if (phoneNumber == null) {
    return phoneNumber
  }

  return phoneNumber
    .replace(/\s+/g, '') // Replace all spaces
    .replace(/\D+/g, '') // Remove all non-number chars
}

function LinkDetails(
  props: PageProps<typeof appRoutes.linkDetails>
): JSX.Element {
  const {
    settings: { mode, extras },
    user,
    organization
  } = useTokenProvider()
  const { goBack } = useAppLinking()

  const [, setLocation] = useLocation()
  const orderId = props.params?.orderId ?? ''

  const linkSalesChannel = useMemo(() => {
    if (extras?.salesChannels != null && extras?.salesChannels.length > 0) {
      return extras.salesChannels[0]
    }
  }, [extras?.salesChannels])

  const { order } = useOrderDetails(orderId)

  const linkScope = useMemo(() => {
    if (order?.market != null) {
      return `market:id:${order.market.id}`
    }
  }, [order?.market])

  const { link, isLoading } = useGetCheckoutLink({
    orderId,
    clientId: linkSalesChannel?.client_id,
    scope: linkScope
  })

  const pageTitle = `Checkout link is ${link?.status}!`

  const expiresIn = formatDate({
    isoDate: link?.expires_at ?? undefined,
    timezone: user?.timezone,
    format: 'full'
  })

  const linkHint: React.ReactNode = (
    <>
      Sales channel: {linkSalesChannel?.name}. Expiry: {expiresIn}. You can{' '}
      <a
        onClick={() => {
          setLocation(
            appRoutes.linkEdit.makePath({
              orderId,
              linkId: link?.id ?? ''
            })
          )
        }}
      >
        <b>edit settings here</b>
      </a>
      .
    </>
  )

  if (link == null) {
    return <></>
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
            currentResourceId: orderId,
            defaultRelativePath: appRoutes.details.makePath({ orderId })
          })
        },
        label: 'Close',
        icon: 'x'
      }}
      isLoading={isLoading}
      scrollToTop
      overlay
    >
      <SkeletonTemplate isLoading={isLoading}>
        <LinkDetailsCard
          link={link}
          linkHint={linkHint}
          primaryAction={
            <A
              variant='secondary'
              size='small'
              alignItems='center'
              target='_blank'
              href={link?.url ?? ''}
            >
              <Icon name='arrowSquareOut' size={16} />
              Open checkout
            </A>
          }
          share={{
            email: {
              to: order.customer_email,
              subject: `Checkout your order (#${order.number})`,
              body: `Dear customer,
                      please follow this link to checkout your order #${order.number}:
                      ${link.url}
                      Thank you,
                      The ${organization?.name} team`.replace(/^\s+/gm, '')
            },
            whatsapp: {
              number: phoneNumberForWhatsapp(order.billing_address?.phone),
              text: `Please follow this link to checkout your order *${order.number}*: ${link.url}`
            }
          }}
        />
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default LinkDetails
