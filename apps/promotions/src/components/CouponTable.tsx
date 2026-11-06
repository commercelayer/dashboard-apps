import {
  Badge,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  formatDate,
  Icon,
  type ResourceListItemTemplateProps,
  Table,
  Td,
  Text,
  Th,
  Tooltip,
  Tr,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Coupon } from "@commercelayer/sdk"
import { makeCoupon } from "src/mocks/resources/coupons"
import { getCouponStatus } from "#data/couponStatus"

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
  isLoading = false,
}: Props): React.JSX.Element => {
  const isFirstLoading = false

  return (
    <>
      <Table
        variant={boxed ? "boxed" : undefined}
        thead={
          <Tr>
            <Th>Code</Th>
            <Th>Status</Th>
            <Th>Usage</Th>
            <Th>Expiry</Th>
            <Th />
          </Tr>
        }
        tbody={
          <>
            {!isLoading && coupons.length === 0 && (
              <Tr>
                <Td colSpan={5}>no results</Td>
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
                  <CouponRow
                    key={[promotionId, idx].join("-")}
                    promotionId={promotionId}
                  />
                ))}
          </>
        }
      />
    </>
  )
}

export const CouponRow = withSkeletonTemplate<
  ResourceListItemTemplateProps<"coupons"> & {
    promotionId: string
    deleteRule?: boolean
    onEdit?: (coupon: Coupon) => void
  }
>(({ resource: coupon = makeCoupon(), remove, deleteRule = false, onEdit }) => {
  const { user } = useTokenProvider()
  const { t } = useTranslation()
  const { sdkClient } = useCoreSdkProvider()
  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

  if (coupon == null) return null

  const status = getCouponStatus(coupon)
  // a coupon without expiry can be used as much as an active one
  const statusBadgeVariant = status === "expired" ? "secondary" : "success"
  const statusLabel = t(`apps.promotions.coupons.status.${status}`)
  const usage = `${coupon.usage_count ?? 0}${coupon.usage_limit != null ? `/${coupon.usage_limit}` : ""}`
  const expiresAt =
    coupon.expires_at == null
      ? null
      : formatDate({
          format: "full",
          isoDate: coupon.expires_at,
          timezone: user?.timezone,
        })

  return (
    <>
      <ConfirmDialog
        icon="trash"
        title={`Delete coupon ${coupon.code}`}
        description="This action cannot be undone."
        confirm={{
          label: "Delete coupon",
          variant: "danger",
          onClick: async () => {
            await sdkClient.coupons.delete(coupon.id)
            // the last coupon takes its promotion rule with it, otherwise the
            // promotion would keep requiring a coupon that no longer exists
            if (deleteRule && coupon.promotion_rule?.id != null) {
              await sdkClient.coupon_codes_promotion_rules.delete(
                coupon.promotion_rule.id,
              )
            }
            remove?.()
          },
        }}
      />
      <Tr key={coupon.id}>
        {/* `px-4`: on mobile cells have no inset of their own, but this table sits
            in a bordered box rather than running edge to edge */}
        <Td className="px-4">
          <div className="flex items-center gap-2">
            <Text weight="semibold">{coupon.code}</Text>
            {coupon.customer_single_use === true && (
              <Tooltip
                content={<>Single use per customer</>}
                label={<Icon name="userRectangle" size={16} />}
              />
            )}
            {/* the Status column is hidden on mobile, so the badge rides with the code */}
            <Badge variant={statusBadgeVariant} className="md:hidden shrink-0">
              {statusLabel}
            </Badge>
          </div>
          {coupon.recipient_email != null && (
            <Text
              tag="div"
              weight="semibold"
              variant="info"
              style={{ fontSize: "11px" }}
            >
              To: {coupon.recipient_email}
            </Text>
          )}
          {/* mobile only: from `md` up Usage and Expiry have columns of their own */}
          <Text tag="div" size="x-small" variant="info" className="md:hidden">
            {usage} used
            {/* without an expiry the badge already says so */}
            {expiresAt != null &&
              ` · ${status === "expired" ? "Expired" : "Expires"} ${expiresAt}`}
          </Text>
        </Td>
        <Td className="hidden md:table-cell">
          <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
        </Td>
        <Td className="hidden md:table-cell">{usage}</Td>
        <Td className="hidden md:table-cell">{expiresAt ?? "—"}</Td>
        <Td align="right" className="px-4">
          <Dropdown
            dropdownItems={
              <>
                <DropdownItem
                  label="Edit"
                  onClick={() => {
                    onEdit?.(coupon)
                  }}
                />
                <DropdownDivider />
                <DropdownItem
                  label="Delete"
                  onClick={() => {
                    showDeleteDialog()
                  }}
                />
              </>
            }
            dropdownLabel={<Icon name="dotsThree" size={16} />}
          />
        </Td>
      </Tr>
    </>
  )
})
