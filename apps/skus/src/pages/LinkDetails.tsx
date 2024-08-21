import {
  Button,
  Card,
  EmptyState,
  Icon,
  InputReadonly,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import { QRCode } from 'react-qrcode-logo'
import { Link, useLocation } from 'wouter'

import { appRoutes, type PageProps } from '#data/routes'
import { useLinkDetails } from '#hooks/useLinkDetails'
import { slugify } from '#utils/slugify'
import { useRef } from 'react'

export const LinkDetails = (
  props: PageProps<typeof appRoutes.linksDetails>
): JSX.Element => {
  const {
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const skuId = props.params?.skuId ?? ''
  const linkId = props.params?.linkId ?? ''

  const linkQrRef = useRef<QRCode>(null)
  const { link, isLoading, error } = useLinkDetails(linkId)

  const handleLinkQrDownload = (): void => {
    linkQrRef.current?.download(
      'jpg',
      `${new Date().toISOString().split('T')[0]}_${slugify(link.name)}`
    )
  }

  if (error != null) {
    return (
      <PageLayout
        title={link?.name}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: 'SKU Lists',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = link?.name

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
            defaultRelativePath: appRoutes.linksList.makePath({ skuId })
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      isLoading={isLoading}
      scrollToTop
      overlay
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Card overflow='visible'>
          <div className='flex justify-center'>
            <QRCode
              ref={linkQrRef}
              value={link.url ?? ''}
              size={300}
              logoImage='https://data.commercelayer.app/assets/logos/glyph/black/commercelayer_glyph_black.svg'
              logoWidth={50}
              logoHeight={50}
              logoPadding={20}
              enableCORS
            />
          </div>
          <Spacer top='12' bottom='4'>
            <InputReadonly value={link?.url ?? ''} showCopyAction />
          </Spacer>
          <div className='flex justify-between'>
            <Button
              variant='secondary'
              size='small'
              alignItems='center'
              onClick={() => {
                setLocation(appRoutes.linksList.makePath({ skuId }))
              }}
            >
              <Icon name='archive' size={16} />
              View archive
            </Button>
            <Button
              variant='primary'
              size='small'
              alignItems='center'
              onClick={handleLinkQrDownload}
            >
              <Icon name='download' size={16} />
              Download
            </Button>
          </div>
        </Card>
      </SkeletonTemplate>
    </PageLayout>
  )
}
