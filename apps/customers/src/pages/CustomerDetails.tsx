import {
  Badge,
  Button,
  EmptyState,
  formatDateWithPredicate,
  getCustomerStatusName,
  type PageHeadingProps,
  PageLayout,
  ResourceAttachments,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useConfirmDialog,
  useCoreApi,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useState } from "react"
import { Link, useLocation, useRoute } from "wouter"
import { CustomerAddresses } from "#components/CustomerAddresses"
import { CustomerAnonymization } from "#components/CustomerAnonymization"
import { CustomerInfo } from "#components/CustomerInfo"
import { CustomerLastOrders } from "#components/CustomerLastOrders"
import { CustomerResetPasswordDialog } from "#components/CustomerResetPasswordDialog"
import { CustomerTimeline } from "#components/CustomerTimeline"
import { CustomerWallet } from "#components/CustomerWallet"
import { appRoutes } from "#data/routes"
import { useCustomerCanBeAnonymized } from "#hooks/useCustomerCanBeAnonymized"
import { useCustomerCanBeDeleted } from "#hooks/useCustomerCanBeDeleted"
import { useCustomerDetails } from "#hooks/useCustomerDetails"

export function CustomerDetails(): React.JSX.Element {
  const {
    settings: { mode, extras },
    user,
    canUser,
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ customerId: string }>(appRoutes.details.path)
  const { goBack } = useAppLinking()
  const { t } = useTranslation()

  const customerId = params?.customerId ?? ""

  const { customer, isLoading, error, mutateCustomer } =
    useCustomerDetails(customerId)
  const canBeDeleted = useCustomerCanBeDeleted(customerId)
  const canBeAnonymized = useCustomerCanBeAnonymized(customerId)

  const { sdkClient } = useCoreSdkProvider()
  const { show, ConfirmDialog } = useConfirmDialog()
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)

  /**
   * A customer with orders cannot be deleted, only anonymized, so the same
   * menu entry confirms whichever of the two is available. Deleting leaves the
   * page; requesting anonymization stays on it and refreshes the customer.
   */
  const deleteDialogProps = canBeDeleted
    ? {
        icon: "trash" as const,
        title: `Delete customer ${customer?.email ?? ""}`,
        description: "This action cannot be undone.",
        confirm: {
          label: t("common.delete_resource", {
            resource: t("resources.customers.name").toLowerCase(),
          }),
          variant: "danger" as const,
          onClick: async () => {
            await sdkClient.customers.delete(customer.id).then(() => {
              setLocation(appRoutes.home.makePath())
            })
          },
        },
      }
    : {
        icon: "eyeSlash" as const,
        title: t("apps.customers.anonymize.title"),
        description: t("apps.customers.anonymize.description"),
        confirm: {
          label: t("apps.customers.anonymize.request_button"),
          variant: "danger" as const,
          onClick: async () => {
            await sdkClient.customers
              .update({ id: customer.id, _request_anonymization: true })
              .then(async () => {
                await mutateCustomer()
              })
          },
        },
      }

  const { data: organization } = useCoreApi("organization", "retrieve", [])
  const enableResetPassword =
    organization?.config?.apps?.customers?.enable_reset_password === true &&
    canUser("create", "customer_password_resets")

  const pageTitle = `${customer.email}`

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (canUser("update", "customers")) {
    pageToolbar.buttons?.push({
      label: t("common.edit"),
      size: "small",
      variant: "secondary",
      onClick: () => {
        setLocation(appRoutes.edit.makePath(customerId))
      },
    })
  }

  if (enableResetPassword) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Reset Password",
        onClick: () => {
          setIsResetPasswordOpen(true)
        },
      },
    ])
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "customers",
      customer.id,
      extras,
    )
    pageToolbar.buttons?.push(resourceInspectorButton)
  }

  if (canBeDeleted || canBeAnonymized) {
    pageToolbar.dropdownItems?.push([
      {
        label: t("common.delete"),
        onClick: () => {
          show()
        },
      },
    ])
  }

  if (error != null) {
    return (
      <PageLayout
        mode={mode}
        title="Customers"
        navigationButton={{
          label: "",
          icon: "arrowLeft",
          variant: "button",
          onClick: () => {
            goBack({
              currentResourceId: customerId,
              defaultRelativePath: appRoutes.home.makePath(),
            })
          },
        }}
        scrollToTop
      >
        <EmptyState
          title={t("common.not_authorized")}
          action={
            <Link href={appRoutes.home.makePath()}>
              <Button variant="primary">{t("common.go_back")}</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar}
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {pageTitle}{" "}
          <Badge variant="secondary">
            {getCustomerStatusName(customer.status)}
          </Badge>
        </SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div>
            {formatDateWithPredicate({
              predicate: t("common.created"),
              isoDate: customer.created_at ?? "",
              timezone: user?.timezone,
              locale: user?.locale,
            })}
          </div>
        </SkeletonTemplate>
      }
      navigationButton={{
        label: "",
        icon: "arrowLeft",
        variant: "button",
        onClick: () => {
          goBack({
            currentResourceId: customerId,
            defaultRelativePath: appRoutes.home.makePath(),
          })
        },
      }}
      // no bottom gap under the heading: the main column opens with a
      // `Spacer top="14"`, which is what the sidebar column lines up with
      gap="only-top"
      fullWidth
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <CustomerAddresses
            customer={customer}
            onRemovedAddress={() => {
              void mutateCustomer()
            }}
          />

          <Spacer top={{ base: "14", lg: "10" }}>
            <ResourceInfoBlocks
              resource={customer}
              title={pageTitle}
              onUpdated={async () => {
                void mutateCustomer()
              }}
              onTagClick={(tagId) => {
                setLocation(appRoutes.home.makePath(`tags_id_in=${tagId}`))
              }}
            />
          </Spacer>
        </SkeletonTemplate>
      }
      // stays last at every width: stacked, it follows the sidebar instead of
      // letting the sidebar sink to the bottom of the page
      scrollToTop
    >
      <SkeletonTemplate isLoading={isLoading}>
        <CustomerAnonymization customerId={customer.id} />
        <CustomerInfo customer={customer} />
        <Spacer top="14">
          <CustomerLastOrders />
        </Spacer>
        <Spacer top="14">
          <CustomerWallet
            customer={customer}
            onRemovedPaymentSource={() => {
              void mutateCustomer()
            }}
          />
        </Spacer>
        <Spacer top="14">
          <ResourceAttachments
            resourceType="customers"
            resourceId={customer.id}
          />
        </Spacer>
        <Spacer top="14">
          <CustomerTimeline customer={customer} />
        </Spacer>
      </SkeletonTemplate>

      {(canBeDeleted || canBeAnonymized) && (
        <ConfirmDialog {...deleteDialogProps} />
      )}
      {enableResetPassword && (
        <CustomerResetPasswordDialog
          customerEmail={customer.email}
          show={isResetPasswordOpen}
          onClose={() => {
            setIsResetPasswordOpen(false)
          }}
        />
      )}
    </PageLayout>
  )
}

export default CustomerDetails
