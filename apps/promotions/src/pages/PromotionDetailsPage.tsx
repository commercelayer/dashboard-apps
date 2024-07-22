import { CouponTable } from '#components/CouponTable'
import { GenericPageNotFound, type PageProps } from '#components/Routes'
import {
  appPromotionsReferenceOrigin,
  promotionConfig
} from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import { usePromotionRules } from '#data/ruleBuilder/usePromotionRules'
import { useDeletePromotionOverlay } from '#hooks/useDeletePromotionOverlay'
import { usePromotion } from '#hooks/usePromotion'
import { usePromotionCoupons } from '#hooks/usePromotionCoupons'
import { isMockedId } from '#mocks'
import type { Promotion } from '#types'
import {
  A,
  Alert,
  Badge,
  Button,
  Card,
  Dropdown,
  DropdownItem,
  Icon,
  ListDetailsItem,
  ListItem,
  PageLayout,
  ResourceMetadata,
  Section,
  SkeletonTemplate,
  Spacer,
  Stack,
  Text,
  formatDate,
  formatDateWithPredicate,
  getPromotionDisplayStatus,
  goBack,
  useCoreSdkProvider,
  useEditMetadataOverlay,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { useMemo } from 'react'
import { Link, useLocation } from 'wouter'

function Page(
  props: PageProps<typeof appRoutes.promotionDetails>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()

  const { isLoading, promotion, mutatePromotion, error } = usePromotion(
    props.params.promotionId
  )

  const { isLoading: isLoadingRules, rules } = usePromotionRules(promotion)
  const hasRules = rules.length > 0
  const viaApi = isGeneratedViaApi(promotion)

  const displayStatus = useDisplayStatus(promotion.id)
  const { sdkClient } = useCoreSdkProvider()

  const { show: showDeleteOverlay, Overlay: DeleteOverlay } =
    useDeletePromotionOverlay()
  const { Overlay: EditMetadataOverlay, show: showEditMetadataOverlay } =
    useEditMetadataOverlay()

  if (error != null) {
    return <GenericPageNotFound />
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {promotion.name}
        </SkeletonTemplate>
      }
      overlay={props.overlay}
      toolbar={{
        buttons: [
          {
            label: displayStatus.isEnabled ? 'Disable' : 'Enable',
            size: 'small',
            onClick: () => {
              void sdkClient[promotion.type]
                .update({
                  id: promotion.id,
                  _disable: displayStatus.isEnabled,
                  _enable: !displayStatus.isEnabled
                })
                .then(() => {
                  void mutatePromotion()
                })
            }
          }
        ],
        dropdownItems: [
          [
            {
              label: 'Edit',
              onClick: () => {
                setLocation(
                  appRoutes.editPromotion.makePath({
                    promotionId: promotion.id
                  })
                )
              }
            },
            {
              label: 'Set metadata',
              onClick: () => {
                showEditMetadataOverlay()
              }
            }
          ],
          [
            {
              label: 'Delete',
              onClick: () => {
                showDeleteOverlay()
              }
            }
          ]
        ]
      }}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Back',
        onClick() {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.home.makePath({})
          })
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <DeleteOverlay promotion={promotion} />
        {!isMockedId(promotion.id) && (
          <EditMetadataOverlay
            resourceType={promotion.type}
            resourceId={promotion.id}
            title='Edit metadata'
            description={promotion.name}
          />
        )}

        <Spacer top='14'>
          {!isLoadingRules && !hasRules && !viaApi && (
            <Alert status='warning'>
              Define activation rules below to prevent application to all
              orders.
            </Alert>
          )}

          {viaApi && (
            <Alert status='info'>
              This promotion is generated via API. Ask developers for details.
              If issues arise, just disable it.
            </Alert>
          )}

          <Spacer top='14'>
            <CardStatus promotionId={props.params.promotionId} />
          </Spacer>
        </Spacer>

        <Spacer top='14'>
          <SectionInfo promotion={promotion} />
        </Spacer>

        <Spacer top='14'>
          <SectionActivationRules promotionId={props.params.promotionId} />
        </Spacer>

        <Spacer top='14'>
          <SectionCoupon promotion={promotion} />
        </Spacer>

        {!isMockedId(promotion.id) && (
          <Spacer top='14'>
            <ResourceMetadata
              overlay={{ title: 'Edit metadata', description: promotion.name }}
              resourceType={promotion.type}
              resourceId={promotion.id}
            />
          </Spacer>
        )}
      </SkeletonTemplate>
    </PageLayout>
  )
}

const isGeneratedViaApi = (promotion: Promotion): boolean =>
  promotion.reference_origin !== appPromotionsReferenceOrigin

const CardStatus = withSkeletonTemplate<{
  promotionId: string
}>(({ promotionId }) => {
  const { promotion } = usePromotion(promotionId)
  const displayStatus = useDisplayStatus(promotionId)
  const config = promotionConfig[promotion.type]

  return (
    <Stack>
      <div>
        <Spacer bottom='2'>
          <Text size='small' variant='info' weight='semibold'>
            Status
          </Text>
        </Spacer>
        <Badge
          variant={displayStatus.status === 'active' ? 'success' : 'secondary'}
        >
          {displayStatus.label}
        </Badge>
      </div>
      <div>
        <Spacer bottom='2'>
          <Text size='small' variant='info' weight='semibold'>
            {promotion.type === 'fixed_price_promotions'
              ? 'Fixed price'
              : 'Discount'}
          </Text>
        </Spacer>
        <Text weight='semibold' style={{ fontSize: '18px' }}>
          <config.StatusDescription
            // @ts-expect-error TS cannot infer the right promotion
            promotion={promotion}
          />
        </Text>
      </div>
      <div>
        <Spacer bottom='2'>
          <Text size='small' variant='info' weight='semibold'>
            Usage
          </Text>
        </Spacer>
        <Text weight='semibold' style={{ fontSize: '18px' }}>
          {promotion.total_usage_count}
          {promotion.total_usage_limit != null &&
            ` / ${promotion.total_usage_limit}`}
        </Text>
      </div>
    </Stack>
  )
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useDisplayStatus = (promotionId: string) => {
  const { user } = useTokenProvider()
  const { promotion } = usePromotion(promotionId)

  const displayStatus = useMemo(() => {
    // @ts-expect-error // TODO: we should fix this error type
    const displayStatus = getPromotionDisplayStatus(promotion)

    let statusDescription = ''
    switch (displayStatus.status) {
      case 'used':
        statusDescription = 'Usage limit exceeded'
        break
      case 'disabled':
        if (promotion.disabled_at != null) {
          statusDescription = formatDateWithPredicate({
            predicate: 'Disabled',
            isoDate: promotion.disabled_at,
            format: 'distanceToNow',
            timezone: user?.timezone
          })
        }
        break
      case 'active':
        statusDescription = formatDateWithPredicate({
          predicate: 'Expires',
          isoDate: promotion.expires_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })
        break
      case 'expired':
        statusDescription = formatDateWithPredicate({
          predicate: 'Expired',
          isoDate: promotion.expires_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })
        break
      case 'upcoming':
        statusDescription = formatDateWithPredicate({
          predicate: 'Active',
          isoDate: promotion.starts_at,
          format: 'distanceToNow',
          timezone: user?.timezone
        })
        break
    }

    return {
      ...displayStatus,
      isEnabled: displayStatus.status !== 'disabled',
      statusDescription
    }
  }, [promotion])

  return displayStatus
}

const SectionInfo = withSkeletonTemplate<{
  promotion: Promotion
}>(({ promotion }) => {
  const { user } = useTokenProvider()
  const config = promotionConfig[promotion.type]
  const viaApi = isGeneratedViaApi(promotion)

  return (
    <Section title='Info'>
      <config.DetailsSectionInfo
        // @ts-expect-error TS cannot infer the right promotion
        promotion={promotion}
      />
      <ListDetailsItem label='Start date' gutter='none'>
        {formatDate({
          isoDate: promotion.starts_at,
          format: 'full',
          timezone: user?.timezone
        })}
      </ListDetailsItem>
      <ListDetailsItem label='Expiration date' gutter='none'>
        {formatDate({
          isoDate: promotion.expires_at,
          format: 'full',
          timezone: user?.timezone
        })}
      </ListDetailsItem>
      {viaApi && (
        <>
          {promotion.market != null && (
            <ListDetailsItem label='Market' gutter='none'>
              {promotion.market.name}
            </ListDetailsItem>
          )}
          {promotion.currency_code != null && (
            <ListDetailsItem label='Currency' gutter='none'>
              {promotion.currency_code}
            </ListDetailsItem>
          )}
        </>
      )}
      {promotion.sku_list != null && (
        <ListDetailsItem label='SKU list' gutter='none'>
          {promotion.sku_list.name}
        </ListDetailsItem>
      )}
      {promotion.exclusive === true && (
        <ListDetailsItem label='Exclusive' gutter='none'>
          No other promotions apply
        </ListDetailsItem>
      )}
      {promotion.priority != null && (
        <ListDetailsItem label='Priority' gutter='none'>
          {promotion.priority}
        </ListDetailsItem>
      )}
      {promotion.reference != null && promotion.reference !== '' && (
        <ListDetailsItem label='Reference' gutter='none'>
          {promotion.reference}
        </ListDetailsItem>
      )}
    </Section>
  )
})

const SectionActivationRules = withSkeletonTemplate<{
  promotionId: string
}>(({ promotionId }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const {
    isLoading: isLoadingPromotion,
    promotion,
    mutatePromotion
  } = usePromotion(promotionId)
  const { isLoading: isLoadingRules, rules } = usePromotionRules(promotion)

  const addActivationRuleLink = appRoutes.newPromotionActivationRule.makePath({
    promotionId: promotion.id
  })

  const hasRules = rules.length > 0

  return (
    <SkeletonTemplate isLoading={isLoadingPromotion || isLoadingRules}>
      <Section
        title='Apply when'
        border='none'
        actionButton={
          hasRules ? (
            <Link href={addActivationRuleLink} asChild>
              <A href='' variant='secondary' size='mini' alignItems='center'>
                <Icon name='plus' />
                Rule
              </A>
            </Link>
          ) : undefined
        }
      >
        {hasRules ? (
          <Card backgroundColor='light' overflow='visible' gap='4'>
            {rules.map((rule, index) => (
              <Spacer key={rule.key} top={index > 0 ? '2' : undefined}>
                <Card overflow='visible' gap='4'>
                  <ListItem padding='none' borderStyle='none'>
                    <div>
                      {rule.label} {rule.valid && `${rule.matcherLabel} `}
                      {rule.values.map((value, i, list) => (
                        <span key={value}>
                          <b>{value}</b>
                          {i < list.length - 1 ? <>,&nbsp;</> : null}
                        </span>
                      ))}
                      {rule.suffixLabel != null && ` ${rule.suffixLabel}`}
                    </div>
                    {rule.valid && (
                      <div>
                        <Dropdown
                          dropdownItems={
                            <>
                              <DropdownItem
                                label='Delete'
                                onClick={function () {
                                  switch (rule.promotionRule.type) {
                                    case 'custom_promotion_rules': {
                                      void sdkClient.custom_promotion_rules
                                        .update({
                                          id: rule.promotionRule.id,
                                          filters: {
                                            ...rule.promotionRule.filters,
                                            [rule.predicate]: undefined
                                          }
                                        })
                                        .then(async () => {
                                          return await mutatePromotion()
                                        })
                                      break
                                    }

                                    case 'sku_list_promotion_rules': {
                                      void sdkClient.sku_list_promotion_rules
                                        .delete(rule.promotionRule.id)
                                        .then(async () => {
                                          return await mutatePromotion()
                                        })
                                      break
                                    }
                                  }
                                }}
                              />
                            </>
                          }
                          dropdownLabel={
                            <Button variant='circle'>
                              <Icon name='dotsThree' size={24} />
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </ListItem>
                </Card>
              </Spacer>
            ))}
          </Card>
        ) : (
          <ListItem
            alignIcon='center'
            icon={<Icon name='sliders' size={32} />}
            paddingSize='6'
            variant='boxed'
          >
            <Text>
              Define the application rules to target specific orders for the
              promotion.
            </Text>
            <Button
              alignItems='center'
              size='small'
              variant='secondary'
              onClick={() => {
                setLocation(addActivationRuleLink)
              }}
            >
              <Icon name='plus' size={16} />
              Rule
            </Button>
          </ListItem>
        )}
      </Section>
    </SkeletonTemplate>
  )
})

const SectionCoupon = withSkeletonTemplate<{
  promotion: Promotion
}>(({ promotion }) => {
  const [, setLocation] = useLocation()
  const {
    isLoading: isLoadingCoupons,
    coupons,
    mutatePromotionCoupons
  } = usePromotionCoupons(
    promotion.coupon_codes_promotion_rule != null ? promotion.id : undefined
  )

  const addCouponLink = appRoutes.newCoupon.makePath({
    promotionId: promotion.id
  })

  const hasCoupons = coupons != null && coupons.length > 0
  const showAll = (coupons?.meta.pageCount ?? 0) > 1

  const emptyList = (
    <ListItem
      alignIcon='center'
      icon={<Icon name='ticket' size={32} />}
      paddingSize='6'
      variant='boxed'
    >
      <Text>
        Activate the promotion only if customer enter a specific coupon code at
        checkout.
      </Text>
      <Button
        alignItems='center'
        size='small'
        variant='secondary'
        onClick={() => {
          setLocation(addCouponLink)
        }}
      >
        <Icon name='plus' size={16} />
        Coupon
      </Button>
    </ListItem>
  )

  return (
    <SkeletonTemplate isLoading={isLoadingCoupons}>
      <Section
        title='Coupons'
        border='none'
        actionButton={
          hasCoupons ? (
            <Link href={addCouponLink} asChild>
              <A href='' variant='secondary' size='mini' alignItems='center'>
                <Icon name='plus' />
                Coupon
              </A>
            </Link>
          ) : undefined
        }
      >
        {hasCoupons ? (
          <CouponTable
            coupons={coupons}
            onDelete={() => {
              void mutatePromotionCoupons()
            }}
            promotionId={promotion.id}
          />
        ) : (
          emptyList
        )}
      </Section>
      {showAll && (
        <Spacer top='4' bottom='4'>
          <Link
            href={appRoutes.couponList.makePath({ promotionId: promotion.id })}
          >
            View all coupons
          </Link>
        </Spacer>
      )}
    </SkeletonTemplate>
  )
})

export default Page
