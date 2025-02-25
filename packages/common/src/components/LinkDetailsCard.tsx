import {
  Button,
  Card,
  CodeBlock,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon,
  Spacer,
  type HintProps
} from '@commercelayer/app-elements'
import type { Link } from '@commercelayer/sdk'
import { useRef, type MutableRefObject } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { slugify } from '../helpers/slugify'

interface Props {
  link: Link
  linkHint?: HintProps['children']
  primaryAction?: React.ReactNode
  showQR?: boolean
  share?: {
    email?: {
      to?: string | null
      subject: string
      body: string
    }
    whatsapp?: {
      number?: string | null
      text: string
    }
  }
}

export const LinkDetailsCard = ({
  link,
  linkHint,
  primaryAction,
  showQR = false,
  share
}: Props): React.JSX.Element => {
  const linkQrRef = useRef<QRCode>(null)

  const handleLinkQrDownload = (): void => {
    linkQrRef.current?.download(
      'jpg',
      `${new Date().toISOString().split('T')[0]}_${slugify(link.name)}`
    )
  }

  const hasShareOptions = share?.email != null || share?.whatsapp != null
  const shareVisible = hasShareOptions || showQR

  return (
    <Card overflow='visible'>
      {showQR && (
        <div className='flex justify-center'>
          <QRCode
            ref={linkQrRef as MutableRefObject<QRCode>}
            value={decodeURIComponent(link.url ?? '')}
            size={300}
            logoImage='https://data.commercelayer.app/assets/logos/glyph/black/commercelayer_glyph_black.svg'
            logoWidth={50}
            logoHeight={50}
            logoPadding={20}
            enableCORS
          />
        </div>
      )}
      <Spacer top={showQR ? '12' : undefined} bottom='6'>
        <CodeBlock
          showCopyAction
          hint={
            linkHint != null
              ? {
                  text: linkHint
                }
              : undefined
          }
        >
          {link?.url ?? ''}
        </CodeBlock>
      </Spacer>
      <div className='flex justify-between'>
        {primaryAction}
        <div className='flex'>
          {shareVisible && (
            <Dropdown
              dropdownLabel={
                <Button variant='primary' size='small' alignItems='center'>
                  <Icon name='shareFat' size={16} />
                  Share
                </Button>
              }
              dropdownItems={
                <>
                  {share?.email != null ? (
                    <DropdownItem
                      icon='envelopeSimple'
                      label='Email'
                      href={encodeURI(
                        `mailto:${share.email.to ?? ''}?subject=${share.email.subject}&body=${share.email.body}`
                      )}
                    />
                  ) : null}
                  {share?.whatsapp != null ? (
                    <DropdownItem
                      icon='whatsappLogo'
                      label='Whatsapp'
                      target='_blank'
                      href={encodeURI(
                        `https://api.whatsapp.com/send?phone=${share.whatsapp.number ?? ''}&text=${share.whatsapp.text}`
                      )}
                    />
                  ) : null}
                  {hasShareOptions && showQR && <DropdownDivider />}
                  {showQR && (
                    <DropdownItem
                      icon='qrCode'
                      label='Download QR'
                      target='_blank'
                      onClick={handleLinkQrDownload}
                    />
                  )}
                </>
              }
            />
          )}
        </div>
      </div>
    </Card>
  )
}
