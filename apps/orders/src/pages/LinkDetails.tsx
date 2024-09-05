import {
  Button,
  Dropdown,
  DropdownItem,
  Icon,
  PageLayout,
  SkeletonTemplate,
  formatDate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

import { appRoutes, type PageProps } from '#data/routes'
import { useGetCheckoutLink } from '#hooks/useGetCheckoutLink'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { LinkDetailsCard } from 'dashboard-apps-common/src/components/LinkDetailsCard'
import { useMemo } from 'react'

function LinkDetails(
  props: PageProps<typeof appRoutes.linkDetails>
): JSX.Element {
  const {
    settings: { mode, extras },
    user,
    organization
  } = useTokenProvider()

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
    isoDate: link?.expires_at,
    timezone: user?.timezone,
    format: 'distanceToNow'
  })

  const shareMail = {
    subject: `Checkout your order (#${order.number})`,
    body: `Dear customer,
please follow this link to checkout your order #${order.number}:
${link?.url}
Thank you,
The ${organization?.name} team`
  }

  const shareWhatsapp = {
    body: `Please follow this link to checkout your order *${order.number}*: ${link?.url}`
  }

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
            setLocation,
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
          linkHint={`Sales channel: ${linkSalesChannel?.name}. Expires ${expiresIn}.`}
          primaryAction={
            <Button
              variant='secondary'
              size='small'
              alignItems='center'
              onClick={() => {
                setLocation(
                  appRoutes.linkEdit.makePath({
                    orderId,
                    linkId: link?.id ?? ''
                  })
                )
              }}
            >
              <Icon name='pencilSimple' size={16} />
              Edit
            </Button>
          }
          secondaryAction={
            <Dropdown
              dropdownLabel={
                <Button variant='primary' size='small' alignItems='center'>
                  <Icon name='shareFat' size={16} />
                  Share
                </Button>
              }
              dropdownItems={
                <>
                  <DropdownItem
                    icon='envelopeSimple'
                    label='Email'
                    href={encodeURI(
                      `mailto:email@example.com?subject=${shareMail.subject}&body=${shareMail.body}`
                    )}
                  />
                  <DropdownItem
                    icon='whatsappLogo'
                    label='Whatsapp'
                    target='_blank'
                    href={encodeURI(
                      `https://api.whatsapp.com/send?text=${shareWhatsapp.body}`
                    )}
                  />
                </>
              }
            />
          }
        />
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default LinkDetails
