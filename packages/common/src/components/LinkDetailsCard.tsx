import {
  Button,
  Card,
  Icon,
  InputReadonly,
  Spacer
} from '@commercelayer/app-elements'
import type { Link } from '@commercelayer/sdk'
import { useRef, type MutableRefObject } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { slugify } from '../helpers/slugify'

interface Props {
  link: Link
  linkHint?: string
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  showQR?: boolean
}

export const LinkDetailsCard = ({
  link,
  linkHint,
  primaryAction,
  secondaryAction,
  showQR = false
}: Props): JSX.Element => {
  const linkQrRef = useRef<QRCode>(null)

  const handleLinkQrDownload = (): void => {
    linkQrRef.current?.download(
      'jpg',
      `${new Date().toISOString().split('T')[0]}_${slugify(link.name)}`
    )
  }

  return (
    <Card overflow='visible'>
      {showQR && (
        <div className='flex justify-center'>
          <QRCode
            ref={linkQrRef as MutableRefObject<QRCode>}
            value={link.url ?? ''}
            size={300}
            logoImage='https://data.commercelayer.app/assets/logos/glyph/black/commercelayer_glyph_black.svg'
            logoWidth={50}
            logoHeight={50}
            logoPadding={20}
            enableCORS
          />
        </div>
      )}
      <Spacer top={showQR ? '12' : undefined} bottom='4'>
        <InputReadonly
          value={link?.url ?? ''}
          showCopyAction
          hint={
            linkHint != null
              ? {
                  text: linkHint
                }
              : undefined
          }
        />
      </Spacer>
      <div className='flex justify-between'>
        {primaryAction}
        <div className='flex'>
          {secondaryAction}
          {showQR && (
            <Button
              variant='primary'
              size='small'
              alignItems='center'
              onClick={handleLinkQrDownload}
            >
              <Icon name='download' size={16} />
              Download
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
