import {
  Badge,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  formatDate,
  Icon,
  type ResourceTableColumn,
  removeFromResourceLists,
  Text,
  Tooltip,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Coupon } from "@commercelayer/sdk"
import { type FC, useMemo } from "react"
import { getCouponStatus } from "#data/couponStatus"

/**
 * Columns of the coupons table in the promotion details.
 *
 * Code is the primary column, the only one on mobile: usage and expiry ride
 * under it there, and get columns of their own from `md` up.
 */
export function useCouponsTableColumns({
  onEdit,
  onDeleted,
}: {
  onEdit: (coupon: Coupon) => void
  /** Called after a coupon is deleted, once the list no longer shows it. */
  onDeleted: () => void
}): Array<ResourceTableColumn<"coupons">> {
  const { user } = useTokenProvider()
  const { t } = useTranslation()

  return useMemo(() => {
    const formatExpiry = (coupon: Coupon): string | null =>
      coupon.expires_at == null
        ? null
        : formatDate({
            format: "full",
            isoDate: coupon.expires_at,
            timezone: user?.timezone,
            locale: user?.locale,
          })

    return [
      {
        header: "Code",
        cell: ({ resource: coupon }) => {
          const expiresAt = formatExpiry(coupon)
          const isExpired = getCouponStatus(coupon) === "expired"
          return (
            // the cell truncates its direct children only, so a multi-line cell
            // has to pass truncation down itself
            <div className="min-w-0 [&>*]:truncate">
              <div className="flex items-center gap-2">
                <Text weight="semibold" className="min-w-0 truncate">
                  {coupon.code}
                </Text>
                {coupon.customer_single_use === true && (
                  <Tooltip
                    content={<>Single use per customer</>}
                    label={<Icon name="userRectangle" size={16} />}
                  />
                )}
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
              {/* mobile only: from `md` up Usage and Expires on have columns of
                  their own */}
              <Text
                tag="div"
                size="x-small"
                variant="info"
                className="md:hidden"
              >
                {formatUsage(coupon)} used
                {expiresAt != null &&
                  ` · ${isExpired ? "Expired" : "Expires"} ${expiresAt}`}
              </Text>
            </div>
          )
        },
      },
      {
        header: "Usage",
        kind: "count",
        align: "left",
        cell: ({ resource: coupon }) => formatUsage(coupon),
      },
      {
        header: "Expires on",
        kind: "datetime",
        cell: ({ resource: coupon }) => {
          const expiresAt = formatExpiry(coupon)
          if (expiresAt == null) {
            return <Text variant="info">—</Text>
          }
          return (
            <div className="flex items-center gap-2">
              <Text wrap="nowrap">{expiresAt}</Text>
              {/* only the expired ones are flagged: the date alone tells the rest */}
              {getCouponStatus(coupon) === "expired" && (
                <Badge variant="secondary" className="shrink-0">
                  {t("apps.promotions.coupons.status.expired")}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        header: "",
        kind: "actions",
        // the only way to edit or delete a coupon, so also on mobile
        hideBelow: "never",
        cell: ({ resource: coupon }) => (
          <CouponRowActions
            coupon={coupon}
            onEdit={onEdit}
            onDeleted={onDeleted}
          />
        ),
      },
    ]
  }, [user?.timezone, user?.locale, t, onEdit, onDeleted])
}

function formatUsage(coupon: Coupon): string {
  return `${coupon.usage_count ?? 0}${coupon.usage_limit != null ? `/${coupon.usage_limit}` : ""}`
}

const CouponRowActions: FC<{
  coupon: Coupon
  onEdit: (coupon: Coupon) => void
  onDeleted: () => void
}> = ({ coupon, onEdit, onDeleted }) => {
  const { sdkClient } = useCoreSdkProvider()
  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

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
            // the list does not include the rule, so it is read before the
            // coupon that links to it is gone
            const { promotion_rule: rule } = await sdkClient.coupons.retrieve(
              coupon.id,
              { include: ["promotion_rule"] },
            )
            await sdkClient.coupons.delete(coupon.id)
            // the last coupon takes its promotion rule with it, otherwise the
            // promotion would keep requiring a coupon that no longer exists.
            // Asked to the API rather than read off the table, which may be
            // filtered or paginated.
            const ruleId = rule?.id
            if (ruleId != null) {
              const remaining = await sdkClient.coupons.list({
                fields: ["id"],
                filters: { promotion_rule_id_eq: ruleId },
                pageSize: 1,
              })
              if (remaining.meta.recordCount === 0) {
                await sdkClient.coupon_codes_promotion_rules.delete(ruleId)
              }
            }
            removeFromResourceLists("coupons", coupon.id)
            onDeleted()
          },
        }}
      />
      <Dropdown
        dropdownLabel={<Icon name="dotsThree" size={16} />}
        dropdownItems={
          <>
            <DropdownItem
              label="Edit"
              onClick={() => {
                onEdit(coupon)
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
      />
    </>
  )
}
