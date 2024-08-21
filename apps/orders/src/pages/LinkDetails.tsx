import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  Icon,
  InputReadonly,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  formatDate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

import { appRoutes, type PageProps } from '#data/routes'
import { useGetCheckoutLink } from '#hooks/useGetCheckoutLink'
import { useOrderDetails } from '#hooks/useOrderDetails'
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
    subject: `Checkout your order (#${orderId})`,
    body: `Dear customer,
please follow this link to checkout your order #${order.number}:
${link?.url}
Thank you,
The ${organization?.name} team`
  }

  const linkUrl =
    'https://react.pfferrari.commercelayer.dev/qJZYhBXjjL?accessToken=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJXWGxFT0Zyam5yIiwic2x1ZyI6ImFsZXNzYW5pIiwiZW50ZXJwcmlzZSI6dHJ1ZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBFbWFpUHpwWiIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlfSwibWFya2V0Ijp7ImlkIjpbImRsUWJQaE5Ob3AiXSwic3RvY2tfbG9jYXRpb25faWRzIjpbIlpuWXFYdXFQblkiLCJRa3hvZXVYWkdXIl0sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjp0cnVlfSwic2NvcGUiOiJtYXJrZXQ6aWQ6ZGxRYlBoTk5vcCIsImV4cCI6MTcyNDI0MTIzNCwidGVzdCI6dHJ1ZSwicmFuZCI6MC4wOTM2Mjg3NzIxMTU2ODgxLCJpYXQiOjE3MjQyMjY4MzQsImlzcyI6Imh0dHBzOi8vY29tbWVyY2VsYXllci5pbyJ9.nOpFLXvnhoPw8k-ZcxDNyQ2NVTEB4sqTbQ-QgMNzxv6HZ-V4Ooa-8ph1vYID8vEbbMiEsaJTxaIUZwhUGjoKa8G0ke9wjhEchKC2pMT9ZVXCI21E3jDh9x8cB9fH9Di3jwVpgyTr42PwMSc_LA5z_G09ZEdOxTW_UUZ4gFG8yrUwrHBPTNBXd89898MPr9WXgXOwEKTAJIXidGnEIgOw3iIa_Feqr4SN0531C480m4umbIO_RNlIa0DyBvh8v4g0-2VgLwN5Fj3fBpRUBKNWlV7yLO8Zf4F_zP4HWTVfrtdmgLKUVZZsMDw77wBusicTiUpw4eI4iq1VdpVO-mEXW2ukGZLw5oV3yv1ZXO2YyDYdQtM7xS7DmWS1NY9o2nksrp_6OsLF93h5HQ3zxS07rTBffxww2JF7MROx_7mVKMgzSyEaaEYm_ZRcsWujxYx5Eca-l_MYCtCuJihLnBaSJLe4lwvKkej-q72bhWEw-oGlnftSKBS9M95RdSs_n9VA7VerIghiusH44dRebyTFxbrFZvqUcf193YFAjWXNAWs5Ep75nuBQ3oePI_Eh1E_-trq5OmSQDd9CMv8aB7K2GQ7mF6Ok0sCUg3j_laiJgJcN-wevEoHXzoA215BjcQdWgWGgvEjqcRN9iYEJxkLbqH9xrUVZAgZjbFlgmq1J9Ks'

  const shareWhatsapp = {
    body: `Please follow this link to checkout your order *${order.number}*: ${linkUrl}`
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
        <Card overflow='visible'>
          <Spacer bottom='4'>
            <InputReadonly
              value={link?.url ?? ''}
              showCopyAction
              hint={{
                text: `Sales channel: ${linkSalesChannel?.name}. Expires ${expiresIn}.`
              }}
            />
          </Spacer>
          <div className='flex justify-between'>
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
          </div>
        </Card>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default LinkDetails
