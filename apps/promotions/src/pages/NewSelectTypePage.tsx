import type { PageProps } from '#components/Routes'
import { promotionConfig, type PromotionType } from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import {
  A,
  Badge,
  Card,
  Grid,
  ListItem,
  Modal,
  PageLayout,
  Section,
  Spacer,
  StatusIcon,
  Text,
  useCoreApi,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import flexPromotionImage from '../assets/flex-promotion.jpg'

function Page(
  props: PageProps<typeof appRoutes.newSelectType>
): React.JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()

  const { data: organization } = useCoreApi('organization', 'retrieve', [])

  const hasRuleEngine = organization?.api_rules_engine === true

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
      <Spacer bottom='6'>
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
          <Section titleSize='small' title='Advanced' border='none'>
            <Grid columns='2'>
              {hasRuleEngine ? (
                <LinkTo promotionType='flex_promotions' />
              ) : (
                <UpsellFlexPromotion />
              )}
              <LinkTo promotionType='external_promotions' />
            </Grid>
          </Section>
        </Spacer>
      </Spacer>
    </PageLayout>
  )
}

function UpsellFlexPromotion(): React.ReactNode {
  const config = promotionConfig.flex_promotions
  const { user } = useTokenProvider()

  const [show, setShow] = useState(false)
  const handleClose = (): void => {
    setShow(false)
  }
  const handleShow = (): void => {
    setShow(true)
  }

  const email = user?.email ?? ''

  return (
    <>
      <Card overflow='visible' onClick={handleShow}>
        <ListItem
          icon={
            <StatusIcon background='black' gap='medium' name={config.icon} />
          }
          padding='none'
          borderStyle='none'
        >
          <></>
          <Badge
            variant='primary-solid'
            icon='lightning'
            style={{
              backgroundColor: '#005FFF'
            }}
          >
            Upgrade
          </Badge>
        </ListItem>
        <Spacer top='4'>
          <Text weight='semibold'>{config.titleList}</Text>
          <Text size='small' tag='div' variant='info'>
            {config.description}
          </Text>
        </Spacer>
      </Card>
      <Modal show={show} onClose={handleClose} size='large'>
        <Modal.Header>Meet the Promotion Builder</Modal.Header>
        <Modal.Body>
          <div className='flex items-stretch gap-6'>
            <div
              style={{
                flexBasis: '242px',
                flexShrink: 0,
                borderRight: '1px solid var(--color-gray-200)',
                margin: '-16px 0 -16px -24px',
                backgroundPosition: 'top left',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundImage: `url(${flexPromotionImage})`
              }}
            />
            <div>
              <Text size='small'>
                <Spacer bottom='6'>
                  <b>
                    Create advanced, flexible promotions with our rule builder.
                  </b>
                  &nbsp;Define complex conditions such as product combinations,
                  attribute-based rules, progressive discounts based on spend or
                  quantity, bundles, or any combination of these.
                </Spacer>

                <Spacer bottom='6'>
                  Configure your rules once, and Commerce Layer automatically
                  applies the promotion at checkout.
                </Spacer>

                <Spacer bottom='6'>
                  Ready to get started? Talk to our team and begin your free
                  30-day trial.
                </Spacer>
              </Text>

              <Spacer top='10' style={{ textAlign: 'right' }}>
                <A
                  variant='primary'
                  size='small'
                  href={`https://commercelayer.fillout.com/t/n7qbQBzH63us?product=flex&email=${email}`}
                  target='_blank'
                >
                  Get started for free
                </A>
              </Spacer>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

function LinkTo({
  promotionType
}: {
  promotionType: PromotionType
}): React.ReactNode {
  const { canUser } = useTokenProvider()
  const config = promotionConfig[promotionType]

  if (
    promotionType !== 'flex_promotions' &&
    !canUser('create', promotionType)
  ) {
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
        <ListItem
          icon={
            <StatusIcon background='black' gap='medium' name={config.icon} />
          }
          padding='none'
          borderStyle='none'
        >
          <></>
        </ListItem>
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
