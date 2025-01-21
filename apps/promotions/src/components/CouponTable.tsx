import { appRoutes } from '#data/routes'
import { useDeleteCouponOverlay } from '#hooks/useDeleteCouponOverlay'
import {
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon,
  Table,
  Td,
  Text,
  Th,
  Tooltip,
  Tr,
  formatDate,
  useTokenProvider,
  withSkeletonTemplate,
  type ResourceListItemTemplateProps
} from '@commercelayer/app-elements'
import type { Coupon } from '@commercelayer/sdk'
import type { FC } from 'react'
import { makeCoupon } from 'src/mocks/resources/coupons'
import { useLocation } from 'wouter'

interface Props {
  coupons: Coupon[]
  promotionId: string
  onDelete: (couponId: string) => void
  boxed?: boolean
  isLoading?: boolean
}

export const CouponTable = ({
  coupons,
  onDelete,
  promotionId,
  boxed = false,
  isLoading = false
}: Props): JSX.Element => {
  const isFirstLoading = false

  return (
    <>
      <Table
        variant={boxed ? 'boxed' : undefined}
        thead={
          <Tr>
            <Th>Code</Th>
            <Th>Used</Th>
            <Th>Expiry</Th>
            <Th />
          </Tr>
        }
        tbody={
          <>
            {!isLoading && coupons.length === 0 && (
              <Tr>
                <Td colSpan={4}>no results</Td>
              </Tr>
            )}
            {coupons?.map((coupon) => (
              <CouponRow
                key={coupon.id}
                resource={coupon}
                promotionId={promotionId}
                deleteRule={coupons.length === 1}
                remove={() => {
                  onDelete(coupon.id)
                }}
              />
            ))}
            {isLoading &&
              Array(isFirstLoading ? 8 : 2) // we want more elements as skeleton on first mount
                .fill(null)
                .map((_, idx) => (
                  <CouponRow key={idx} promotionId={promotionId} />
                ))}
          </>
        }
      />
    </>
  )
}

export const CouponRow: FC<
  ResourceListItemTemplateProps<'coupons'> & {
    promotionId: string
    deleteRule?: boolean
  }
> = withSkeletonTemplate(
  ({
    resource: coupon = makeCoupon(),
    promotionId,
    remove,
    deleteRule = false
  }) => {
    const [, setLocation] = useLocation()
    const { user } = useTokenProvider()
    const { show: showDeleteCouponOverlay, Overlay: CouponOverlay } =
      useDeleteCouponOverlay()

    return (
      <>
        <CouponOverlay
          onDelete={() => {
            remove?.()
          }}
        />
        <Tr key={coupon.id}>
          <Td>
            <Text
              weight='semibold'
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              {coupon.code}
              {coupon.customer_single_use === true && (
                <Tooltip
                  content={<>Single use per customer</>}
                  label={<Icon name='userRectangle' size={16} />}
                />
              )}
            </Text>
            {coupon.recipient_email != null && (
              <Text
                tag='div'
                weight='semibold'
                variant='info'
                style={{ fontSize: '11px' }}
              >
                To: {coupon.recipient_email}
              </Text>
            )}
          </Td>
          <Td>
            {coupon.usage_count}
            {coupon.usage_limit != null ? ` / ${coupon.usage_limit}` : ''}
          </Td>
          <Td>
            {coupon.expires_at == null
              ? 'Never'
              : formatDate({
                  format: 'distanceToNow',
                  isoDate: coupon.expires_at,
                  timezone: user?.timezone
                })}
          </Td>
          <Td align='right'>
            <Dropdown
              dropdownItems={
                <>
                  <DropdownItem
                    label='Edit'
                    onClick={() => {
                      setLocation(
                        appRoutes.editCoupon.makePath({
                          promotionId,
                          couponId: coupon.id
                        })
                      )
                    }}
                  />
                  <DropdownDivider />
                  <DropdownItem
                    label='Delete'
                    onClick={() => {
                      showDeleteCouponOverlay({
                        coupon,
                        deleteRule
                      })
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
          </Td>
        </Tr>
      </>
    )
  }
)
