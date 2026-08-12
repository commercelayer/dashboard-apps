import {
  A,
  Alert,
  Badge,
  Button,
  Card,
  CodeEditor,
  Dropdown,
  DropdownItem,
  formatDate,
  formatDateWithPredicate,
  getPromotionDisplayStatus,
  Icon,
  Input,
  isMockedId,
  ListItem,
  type PageHeadingProps,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  Section,
  SkeletonTemplate,
  Spacer,
  Stack,
  Text,
  useAppLinking,
  useConfirmDialog,
  useCoreSdkProvider,
  useResourceList,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { FlexPromotion } from "@commercelayer/sdk"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { type Ref, useMemo, useRef, useState } from "react"
import { Link, useLocation } from "wouter"
import { CouponList } from "#components/CouponList"
import { SectionFlexRules } from "#components/FlexRuleBuilder"
import { GenericPageNotFound, type PageProps } from "#components/Routes"
import {
  appPromotionsReferenceOrigin,
  promotionConfig,
} from "#data/promotions/config"
import { appRoutes } from "#data/routes"
import { ruleBuilderConfig } from "#data/ruleBuilder/config"
import { usePromotionRules } from "#data/ruleBuilder/usePromotionRules"
import { usePromotion } from "#hooks/usePromotion"
import type { Promotion } from "#types"

function Page(
  props: PageProps<typeof appRoutes.promotionDetails>,
): React.JSX.Element {
  const {
    settings: { mode, extras },
  } = useTokenProvider()
  const { goBack } = useAppLinking()

  const [, setLocation] = useLocation()

  const { isLoading, promotion, mutatePromotion, error } = usePromotion(
    props.params.promotionId,
  )

  const { isLoading: isLoadingRules, rules } = usePromotionRules(promotion)
  const hasRules = rules.length > 0
  const viaApi = isGeneratedViaApi(promotion)

  const displayStatus = useDisplayStatus(promotion.id)
  const { sdkClient } = useCoreSdkProvider()

  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

  const pageTitle = promotion.name

  const toolbar: PageHeadingProps["toolbar"] = {
    buttons: [
      {
        label: displayStatus.isEnabled ? "Disable" : "Enable",
        size: "small",
        onClick: () => {
          void sdkClient[promotion.type]
            .update({
              id: promotion.id,
              _disable: displayStatus.isEnabled,
              _enable: !displayStatus.isEnabled,
            })
            .then(() => {
              void mutatePromotion()
            })
        },
      },
    ],
    dropdownItems: [
      [
        {
          label: "Edit",
          onClick: () => {
            setLocation(
              appRoutes.editPromotion.makePath({
                promotionId: promotion.id,
              }),
            )
          },
        },
      ],
      [
        {
          label: "Delete",
          onClick: () => {
            showDeleteDialog()
          },
        },
      ],
    ],
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      promotion.type,
      promotion.id,
      extras,
    )
    toolbar.buttons?.push(resourceInspectorButton)
  }

  if (promotion.type === "flex_promotions") {
    toolbar.dropdownItems?.[0]?.push({
      label: "Duplicate",
      onClick: () => {
        void sdkClient.flex_promotions
          .create({
            expires_at: promotion.expires_at,
            starts_at: promotion.starts_at,
            name: `${promotion.name} (copy)`,
            rules: promotion.rules,
            _disable: true,
          })
          .then((promotion) => {
            setLocation(
              appRoutes.promotionDetails.makePath({
                promotionId: promotion.id,
              }),
            )
          })
      },
    })
  }

  if (error != null) {
    return <GenericPageNotFound />
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {pageTitle}
          <Badge
            variant={
              displayStatus.status === "active" ? "success" : "secondary"
            }
            className="inline-block align-middle ml-2"
          >
            {displayStatus.label.toLowerCase()}
          </Badge>
        </SkeletonTemplate>
      }
      overlay={props.overlay}
      toolbar={toolbar}
      mode={mode}
      gap="only-top"
      navigationButton={{
        label: "Back",
        onClick() {
          goBack({
            currentResourceId: promotion.id,
            defaultRelativePath: appRoutes.home.makePath({}),
          })
        },
      }}
      fullWidth
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer top="14">
            <Card overflow="visible">
              <ResourceDetails
                resource={promotion}
                onUpdated={async () => {
                  void mutatePromotion()
                }}
              />
              {!isMockedId(promotion.id) && (
                <>
                  <Spacer top="10">
                    <ResourceTags
                      overlay={{
                        title: pageTitle,
                      }}
                      resourceType={promotion.type}
                      resourceId={promotion.id}
                    />
                  </Spacer>
                  <Spacer top="10">
                    <ResourceMetadata
                      overlay={{
                        title: pageTitle,
                      }}
                      resourceType={promotion.type}
                      resourceId={promotion.id}
                    />
                  </Spacer>
                </>
              )}
            </Card>
          </Spacer>
        </SkeletonTemplate>
      }
      // the flex check belongs at the very bottom, below the sidebar, and only
      // flex promotions have one
      afterSidebar={
        promotion.type === "flex_promotions" ? (
          <SkeletonTemplate isLoading={isLoading}>
            <Spacer top="14" bottom="4">
              <SectionCheck promotion={promotion} />
            </Spacer>
          </SkeletonTemplate>
        ) : undefined
      }
    >
      <SkeletonTemplate isLoading={isLoading}>
        <ConfirmDialog
          icon="trash"
          title={`Delete promotion ${promotion.name}`}
          description="This action cannot be undone."
          confirm={{
            label: "Delete promotion",
            variant: "danger",
            onClick: async () => {
              // the delete lives on the concrete promotion type, not on `promotions`
              await sdkClient[promotion.type].delete(promotion.id)
              setLocation(appRoutes.home.makePath({}))
            },
          }}
        />
        {/* the two stacks are adjacent on purpose: they pull together into a
            single grid, so the six values read as one block */}
        <Spacer top="10">
          <CardStatus promotionId={props.params.promotionId} />
          <SectionInfo promotion={promotion} />
        </Spacer>

        <Spacer top="14">
          {!isLoadingRules &&
            !hasRules &&
            !viaApi &&
            promotion.type !== "flex_promotions" && (
              <Alert status="warning">
                Define activation rules below to prevent application to all
                orders.
              </Alert>
            )}

          {viaApi && promotion.type !== "flex_promotions" && (
            <Alert status="info">
              This promotion is generated via API. Ask developers for details.
              If issues arise, just disable it.
            </Alert>
          )}
        </Spacer>

        {promotion.type === "flex_promotions" && (
          <>
            <Spacer top="14">
              <SectionFlexRules promotion={promotion} />
            </Spacer>
          </>
        )}

        {promotion.type !== "flex_promotions" && (
          <>
            <Spacer top="14">
              <SectionActivationRules promotionId={props.params.promotionId} />
            </Spacer>
          </>
        )}

        {/* the coupons list, previously a tab of its own */}
        {!isMockedId(promotion.id) && (
          <Spacer top="14">
            <CouponList promotion={promotion} />
          </Spacer>
        )}
      </SkeletonTemplate>
    </PageLayout>
  )
}

function SectionCheck({
  promotion,
}: {
  promotion: Extract<Promotion, FlexPromotion>
}) {
  const {
    settings: { accessToken, domain, organizationSlug },
  } = useTokenProvider()

  const [results, setResults] = useState<any>()

  const matches = results?.data?.filter((d: { match: boolean }) => d.match)

  return (
    <Section title="Check">
      <Spacer top="4">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const orderId = new FormData(event.currentTarget).get("orderId")

            void fetch(
              `https://${organizationSlug}.${domain}/api/flex_promotions/${promotion.id}/check/${orderId?.toString()}`,
              {
                method: "GET",
                headers: {
                  authorization: `Bearer ${accessToken}`,
                  "content-type": "application/vnd.api+json",
                },
              },
            )
              .then(async (response) => await response.json())
              .then(async (json) => {
                setResults(json)
              })
          }}
        >
          <Input name="orderId" placeholder="Order id" />
          <Button type="submit" style={{ border: "none" }}>
            Check
          </Button>
        </form>
        {results != null && (
          <Spacer top="4">
            <Text size="small">
              <Spacer bottom="1">
                {matches == null
                  ? "Oops, something went wrong 😱"
                  : matches.length > 0
                    ? "Hurray! It matches 🎉"
                    : "So sad, it doesn't match 😢"}
              </Spacer>
            </Text>
            {results.data.map((rule: any, index: number) => (
              <CheckItem key={rule.id} index={index} rule={rule} />
            ))}
          </Spacer>
        )}
      </Spacer>
    </Section>
  )
}

function CheckItem({
  index,
  rule,
}: {
  index: number
  rule: any
}): React.JSX.Element {
  const [show, setShow] = useState(false)

  type ExtractRef<T> = T extends { ref?: Ref<infer R> } ? R | null : never
  const ref = useRef<ExtractRef<Parameters<typeof CodeEditor>[0]>>(null)

  const idx = `#${(index + 1).toString().padStart(2, "0")}`

  return (
    <div>
      <Spacer top="4">
        <Card
          overflow="visible"
          gap="4"
          style={{
            backgroundColor:
              rule.match === true
                ? "var(--color-green-50)"
                : "var(--color-red-50)",
            color:
              rule.match === true
                ? "var(--color-green-700)"
                : "var(--color-red-700)",
          }}
        >
          <div>
            <button
              type="button"
              onClick={() => {
                setShow(!show)
              }}
              className="flex items-center justify-between w-full gap-2"
            >
              <div className="text-left flex gap-4">
                <b>{idx}</b>
                <div>{rule.name}</div>
              </div>
              <Icon
                name={show ? "caretDown" : "caretRight"}
                size={16}
                className="shrink-0"
              />
            </button>
            {show && (
              <Spacer top="4">
                <CodeEditor
                  ref={ref}
                  readOnly
                  language="json"
                  value={JSON.stringify(rule, undefined, 2)}
                  jsonSchema="none"
                  height={550}
                />
              </Spacer>
            )}
          </div>
        </Card>
      </Spacer>
    </div>
  )
}

const isGeneratedViaApi = (promotion: Promotion): boolean =>
  promotion.reference_origin !== appPromotionsReferenceOrigin

const CardStatus = withSkeletonTemplate<{
  promotionId: string
}>(({ promotionId }) => {
  const { promotion } = usePromotion(promotionId)
  const { user } = useTokenProvider()
  const config = promotionConfig[promotion.type]

  const query = useMemo<Parameters<typeof useResourceList>[0]["query"]>(() => {
    return {
      filters: {
        promotion_rule_promotion_id_eq: promotionId,
      },
      sort: ["-updated_at"],
      pageSize: 10,
    }
  }, [promotionId])

  const { meta } = useResourceList({
    type: "coupons",
    query,
  })

  return (
    <Stack>
      <div>
        <Spacer bottom="2">
          <Text size="small" variant="info" weight="semibold">
            {promotion.type === "fixed_price_promotions"
              ? "Fixed price"
              : "Discount"}
          </Text>
        </Spacer>
        <Text weight="semibold" style={{ fontSize: "18px" }}>
          <config.StatusDescription
            // @ts-expect-error TS cannot infer the right promotion
            promotion={promotion}
          />
        </Text>
      </div>
      <div>
        <Spacer bottom="2">
          <Text size="small" variant="info" weight="semibold">
            Usage
          </Text>
        </Spacer>
        <Text weight="semibold" style={{ fontSize: "18px" }}>
          {promotion.total_usage_count}
          {promotion.total_usage_limit != null &&
            ` / ${promotion.total_usage_limit}`}
        </Text>
      </div>
      <div>
        <Spacer bottom="2">
          <Text size="small" variant="info" weight="semibold">
            Coupons
          </Text>
        </Spacer>
        <Text weight="semibold" style={{ fontSize: "18px" }}>
          {meta?.recordCount?.toLocaleString(user?.locale, {
            useGrouping: "always",
          })}
        </Text>
      </div>
    </Stack>
  )
})

const useDisplayStatus = (promotionId: string) => {
  const { user } = useTokenProvider()
  const { promotion } = usePromotion(promotionId)

  const displayStatus = useMemo(() => {
    const displayStatus = getPromotionDisplayStatus(promotion)

    let statusDescription = ""
    switch (displayStatus.status) {
      case "used":
        statusDescription = "Usage limit exceeded"
        break
      case "disabled":
        if (promotion.disabled_at != null) {
          statusDescription = formatDateWithPredicate({
            predicate: "Disabled",
            isoDate: promotion.disabled_at,
            format: "distanceToNow",
            timezone: user?.timezone,
          })
        }
        break
      case "active":
        statusDescription = formatDateWithPredicate({
          predicate: "Expires",
          isoDate: promotion.expires_at,
          format: "distanceToNow",
          timezone: user?.timezone,
        })
        break
      case "expired":
        statusDescription = formatDateWithPredicate({
          predicate: "Expired",
          isoDate: promotion.expires_at,
          format: "distanceToNow",
          timezone: user?.timezone,
        })
        break
      case "upcoming":
        statusDescription = formatDateWithPredicate({
          predicate: "Active",
          isoDate: promotion.starts_at,
          format: "distanceToNow",
          timezone: user?.timezone,
        })
        break
    }

    return {
      ...displayStatus,
      isEnabled: displayStatus.status !== "disabled",
      statusDescription,
    }
  }, [promotion])

  return displayStatus
}

/**
 * When the promotion runs and what it applies to.
 *
 * Deliberately three cells, aligning with the `CardStatus` stack above: that one
 * already carries Discount, Usage and Coupons, so repeating them here would show
 * the same values twice — and its versions are the better ones (a per-type
 * description, and a real coupon count rather than the `coupons_count` attribute,
 * which flex promotions do not have).
 *
 * The per-type extras still render underneath, since a few types (external, free
 * gift, buy X pay Y) carry information of their own.
 */
const SectionInfo = withSkeletonTemplate<{
  promotion: Promotion
}>(({ promotion }) => {
  const { user } = useTokenProvider()
  const config = promotionConfig[promotion.type]

  /** What the promotion is scoped to, most specific first. */
  const appliesTo =
    promotion.type === "flex_promotions"
      ? undefined
      : (promotion.sku_list?.name ?? promotion.market?.name)

  return (
    <>
      <Stack>
        <InfoCell label="Started on">
          {promotion.starts_at == null ? (
            <EmptyValue />
          ) : (
            formatDate({
              isoDate: promotion.starts_at,
              format: "full",
              timezone: user?.timezone,
              showCurrentYear: true,
            })
          )}
        </InfoCell>
        <InfoCell label="Expires on">
          {promotion.expires_at == null ? (
            <EmptyValue />
          ) : (
            formatDate({
              isoDate: promotion.expires_at,
              format: "full",
              timezone: user?.timezone,
              showCurrentYear: true,
            })
          )}
        </InfoCell>
        <InfoCell label="Apply to">{appliesTo ?? <EmptyValue />}</InfoCell>
      </Stack>
      <config.DetailsSectionInfo
        // @ts-expect-error TS cannot infer the right promotion
        promotion={promotion}
      />
    </>
  )
})

/** One cell of the stack: a muted label above the value. */
function InfoCell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div>
      <Spacer bottom="2">
        <Text size="small" tag="div" variant="info" weight="semibold">
          {label}
        </Text>
      </Spacer>
      <Text tag="div" weight="semibold">
        {children}
      </Text>
    </div>
  )
}

function EmptyValue(): React.JSX.Element {
  return <Text className="text-gray-300">&#8212;</Text>
}

const SectionActivationRules = withSkeletonTemplate<{
  promotionId: string
}>(({ promotionId }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const {
    isLoading: isLoadingPromotion,
    promotion,
    mutatePromotion,
  } = usePromotion(promotionId)
  const { isLoading: isLoadingRules, rules } = usePromotionRules(promotion)

  const addActivationRuleLink = appRoutes.newPromotionActivationRule.makePath({
    promotionId: promotion.id,
  })

  const hasRules = rules.length > 0

  return (
    <SkeletonTemplate isLoading={isLoadingPromotion || isLoadingRules}>
      <Section
        title="Apply when"
        border="none"
        actionButton={
          hasRules ? (
            <Link href={addActivationRuleLink} asChild>
              <A href="" variant="secondary" size="mini" alignItems="center">
                <Icon name="plus" />
                Rule
              </A>
            </Link>
          ) : undefined
        }
      >
        {hasRules ? (
          <Card backgroundColor="light" overflow="visible" gap="4">
            {rules.map((rule, index) => {
              const showOperatorLabel =
                "configKey" in rule &&
                ruleBuilderConfig[rule.configKey]?.operators != null &&
                Object.keys(ruleBuilderConfig[rule.configKey]?.operators ?? {})
                  .length > 1

              return (
                <Spacer key={rule.key} top={index > 0 ? "2" : undefined}>
                  <Card overflow="visible" gap="4">
                    <ListItem padding="none" borderStyle="none">
                      <div>
                        {`${rule.label} `}
                        {`${showOperatorLabel ? `${rule.matcherLabel} ` : ""}`}
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
                                  label="Delete"
                                  onClick={() => {
                                    switch (rule.promotionRule.type) {
                                      case "custom_promotion_rules": {
                                        void sdkClient.custom_promotion_rules
                                          .update({
                                            id: rule.promotionRule.id,
                                            filters: {
                                              ...rule.promotionRule.filters,
                                              [rule.predicate]: undefined,
                                            },
                                          })
                                          .then(async () => {
                                            return await mutatePromotion()
                                          })
                                        break
                                      }

                                      case "sku_list_promotion_rules": {
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
                              <Button variant="circle">
                                <Icon name="dotsThree" size={24} />
                              </Button>
                            }
                          />
                        </div>
                      )}
                    </ListItem>
                  </Card>
                </Spacer>
              )
            })}
          </Card>
        ) : (
          <ListItem
            alignIcon="center"
            icon={<Icon name="sliders" size={32} />}
            paddingSize="6"
            variant="boxed"
          >
            <Text>
              Define the application rules to target specific orders for the
              promotion.
            </Text>
            <Button
              alignItems="center"
              size="small"
              variant="secondary"
              onClick={() => {
                setLocation(addActivationRuleLink)
              }}
            >
              <Icon name="plus" size={16} />
              Rule
            </Button>
          </ListItem>
        )}
      </Section>
    </SkeletonTemplate>
  )
})

export default Page
