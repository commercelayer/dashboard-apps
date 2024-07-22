import type { PageProps } from '#components/Routes'
import { promotionConfig, type PromotionType } from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import {
  Card,
  Grid,
  PageLayout,
  Section,
  Spacer,
  StatusIcon,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.newSelectType>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  return (
    <PageLayout
      title='Select type'
      overlay={props.overlay}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
    >
      <Spacer top='10'>
        <Section titleSize='small' title='Preset' border='none'>
          <Grid columns='2'>
            <LinkTo promotionType='percentage_discount_promotions' />
            <LinkTo promotionType='free_shipping_promotions' />
            <LinkTo promotionType='fixed_amount_promotions' />
            <LinkTo promotionType='free_gift_promotions' />
            <LinkTo promotionType='fixed_price_promotions' />
            <LinkTo promotionType='buy_x_pay_y_promotions' />
          </Grid>
        </Section>
      </Spacer>
      <Spacer top='10'>
        <Section titleSize='small' title='More' border='none'>
          <Grid columns='1'>
            <LinkTo promotionType='external_promotions' />
          </Grid>
        </Section>
      </Spacer>
    </PageLayout>
  )
}

function LinkTo({
  promotionType
}: {
  promotionType: PromotionType
}): React.ReactNode {
  const { canUser } = useTokenProvider()
  const config = promotionConfig[promotionType]

  if (!canUser('create', promotionType)) {
    return null
  }

  return (
    <Link
      href={appRoutes.newPromotion.makePath({
        promotionType: config.type
      })}
      asChild
    >
      <Card overflow='visible'>
        <StatusIcon background='black' gap='medium' name={config.icon} />
        <Spacer top='4'>
          <Text weight='semibold'>{config.titleList}</Text>
          <Text size='small' tag='div' variant='info'>
            {config.description}
          </Text>
        </Spacer>
      </Card>
    </Link>
  )
}

export default Page
