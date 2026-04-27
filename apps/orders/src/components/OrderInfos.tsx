import {
  isMockedId,
  ListDetailsItem,
  Section,
  useCoreApi,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { languageList } from "./NewOrder/languages"

interface Props {
  order: Order
}

export const OrderInfos = withSkeletonTemplate<Props>(
  ({ order }): React.JSX.Element | null => {
    const { t } = useTranslation()

    const linkId = (
      order.metadata?.links_api as { link_id?: string } | undefined
    )?.link_id

    const { data: link } = useCoreApi(
      "links",
      "retrieve",
      linkId != null && !isMockedId(order.id) ? [linkId] : null,
    )

    const language = languageList.find(
      ({ value }) => value === order.language_code,
    )?.label

    const marketName = order.market?.name

    if (marketName == null && language == null && link == null) {
      return null
    }

    return (
      <Section title={t("common.info")}>
        {marketName != null && (
          <ListDetailsItem label={t("resources.markets.name")} gutter="none">
            {marketName}
          </ListDetailsItem>
        )}
        {language != null && (
          <ListDetailsItem label={t("common.language")} gutter="none">
            {language}
          </ListDetailsItem>
        )}
        {link != null && (
          <ListDetailsItem label={t("resources.links.name")} gutter="none">
            {link.name}
          </ListDetailsItem>
        )}
      </Section>
    )
  },
)
