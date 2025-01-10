import {
  A,
  Icon,
  PageLayout,
  SkeletonTemplate,
  formatDate,
  useAppLinking,
  useTokenProvider,
  useTranslation
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
  const { t } = useTranslation()

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

  const pageTitle = t('common.links.checkout_link_status', {
    status: link?.status
  })

  const expiresIn = formatDate({
    isoDate: link?.expires_at ?? undefined,
    timezone: user?.timezone,
    locale: user?.locale,
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
        label: t('common.close'),
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
              {t('common.links.open_checkout')}
            </A>
          }
          share={{
            email: {
              to: order.customer_email,
              subject: t('common.links.share_email_subject', {
                number: order.number
              }),
              body: t('common.links.share_email_body', {
                number: order.number,
                url: link.url,
                organization: organization?.name,
                interpolation: { escapeValue: false }
              })
            },
            whatsapp: {
              number: phoneNumberForWhatsapp(order.billing_address?.phone),
              text: t('common.links.share_whatsapp_text', {
                number: order.number,
                url: link.url,
                interpolation: { escapeValue: false }
              })
            }
          }}
        />
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default LinkDetails
