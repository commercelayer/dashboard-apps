import {
  Badge,
  type BadgeProps,
  getOrderReviewDisplayStatus,
  ListDetailsItem,
  Section,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { getLastOrderReview } from "#hooks/useOrderReview"

const badgeVariant: Record<
  "pending" | "accepted" | "rejected",
  BadgeProps["variant"]
> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
}

/**
 * The latest customer review of a B2B order: where it stands, what the seller
 * asked, and what the customer answered. Nothing until the seller has asked.
 */
export const OrderReview = withSkeletonTemplate<{ order: Order }>(
  ({ order }): React.JSX.Element | null => {
    const { t } = useTranslation()
    const {
      settings: { extras },
    } = useTokenProvider()

    if (extras?.organization?.isAgreementsEnabled !== true) {
      return null
    }

    const review = getLastOrderReview(order)
    if (review == null) {
      return null
    }

    const { label } = getOrderReviewDisplayStatus(review, "seller")

    return (
      <Section title={t("apps.orders.details.customer_review")}>
        <ListDetailsItem
          label={t("apps.orders.attributes.status")}
          gutter="none"
        >
          <Badge variant={badgeVariant[review.status]}>{label}</Badge>
        </ListDetailsItem>
        {review.reason != null && review.reason !== "" && (
          <ListDetailsItem
            label={t("apps.orders.details.review_seller_note")}
            gutter="none"
          >
            {review.reason}
          </ListDetailsItem>
        )}
        {review.notes != null && review.notes !== "" && (
          <ListDetailsItem
            label={t("apps.orders.details.review_customer_note")}
            gutter="none"
          >
            {review.notes}
          </ListDetailsItem>
        )}
      </Section>
    )
  },
)
