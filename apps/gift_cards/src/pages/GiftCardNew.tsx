import { appRoutes } from '#data/routes'
import {
  PageLayout,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { useLocation } from 'wouter'

const GiftCardNew: FC = () => {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  return (
    <PageLayout
      mode={mode}
      title='New gift card'
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.list.makePath({})
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      gap='only-top'
      scrollToTop
    >
      Create Gift card page
    </PageLayout>
  )
}

export default GiftCardNew
