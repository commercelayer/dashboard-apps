import {
  A,
  EmptyState,
  Text,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"

interface Props {
  scope?: "history" | "userFiltered"
}

export function ListEmptyState({
  scope = "history",
}: Props): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { t } = useTranslation()

  if (scope === "userFiltered") {
    return (
      <Text weight="semibold">
        {t("common.empty_states.no_resources_found_for_filters", {
          resources: t(
            "resources.order_subscriptions.name_other",
          ).toLowerCase(),
        })}
      </Text>
    )
  }

  if (canUser("create", "order_subscriptions")) {
    return (
      <EmptyState
        title={t("common.empty_states.no_resource_found", {
          resource: t("resources.order_subscriptions.name").toLowerCase(),
        })}
        description={
          <div>
            <p>
              {t("common.empty_states.no_resources_found_for_filters", {
                resources: t(
                  "resources.order_subscriptions.name_other",
                ).toLowerCase(),
              })}
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title={t("common.empty_states.no_resource_yet", {
        resource: t("resources.order_subscriptions.name").toLowerCase(),
      })}
      description={
        <div>
          <p>
            {t("common.empty_states.create_the_first_resource", {
              resource: t("resources.order_subscriptions.name").toLowerCase(),
            })}
          </p>
          <A
            target="_blank"
            href="https://docs.commercelayer.io/core/v/api-reference/order_subscriptions"
            rel="noreferrer"
          >
            {t("common.view_api_docs")}
          </A>
        </div>
      }
    />
  )
}
