import {
  Button,
  Dropdown,
  DropdownItem,
  Icon,
  SearchBar,
  Section,
  Spacer,
  Text,
  type UseResourceListConfig,
  useCoreSdkProvider,
  useResourceList,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Coupon, Import, QueryFilter } from "@commercelayer/sdk"
import { type FC, useMemo, useState } from "react"
import { CouponFormModal } from "#components/CouponFormModal"
import { CouponGeneratorModal } from "#components/CouponGeneratorModal"
import { CouponRow } from "#components/CouponTable"
import type { CouponStatus } from "#data/couponStatus"
import type { Promotion } from "#types"

// a coupon reads as one of these from its expiry, see `getCouponStatus`
type FilterStatus = "all" | CouponStatus

interface CouponListProps {
  promotion: Promotion
}
export const CouponList: FC<CouponListProps> = ({ promotion }) => {
  const { canUser } = useTokenProvider()
  const { t } = useTranslation()
  // `null` when closed; an empty object opens it to create a coupon
  const [couponFormModal, setCouponFormModal] = useState<{
    coupon?: Coupon
  } | null>(null)
  const [showCouponGenerator, setShowCouponGenerator] = useState(false)
  const [searchValue, setSearchValue] = useState<string>()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const { sdkClient } = useCoreSdkProvider()
  const [currentImportJob, setCurrentImportJob] = useState<Import | null>(null)

  const filterStatusLabel: Record<FilterStatus, string> = {
    all: t("common.all"),
    active: t("apps.promotions.coupons.status.active"),
    expired: t("apps.promotions.coupons.status.expired"),
    never_expires: t("apps.promotions.coupons.status.never_expires"),
  }

  const filterStatusList: FilterStatus[] = [
    "all",
    "active",
    "expired",
    "never_expires",
  ]

  const filterStatusPredicate: Record<FilterStatus, QueryFilter> = {
    all: {},
    active: { expires_at_gt: new Date().toJSON() },
    expired: { expires_at_lt: new Date().toJSON() },
    never_expires: { expires_at_null: true },
  }

  const query = useMemo<UseResourceListConfig<"coupons">["query"]>(() => {
    return {
      filters: {
        promotion_rule_promotion_id_eq: promotion.id,
        ...(searchValue != null
          ? { code_or_coupon_recipient_email_i_cont: searchValue }
          : {}),
        ...(filterStatusPredicate[filterStatus] ?? {}),
      },
      sort: ["-updated_at"],
      pageSize: 25,
    }
  }, [filterStatus, searchValue])

  const { list, ResourceList, refresh, Pagination } = useResourceList({
    type: "coupons",
    query,
    paginationType: "pagination",
    paginationScrollTo: "list",
  })

  return (
    // titled here: it used to be a tab named "Coupons"
    <Section
      title="Coupons"
      actionButton={
        <Dropdown
          dropdownLabel={
            <Button alignItems="center" size="mini" variant="secondary">
              <Icon name="plus" size={16} />
              New
            </Button>
          }
          dropdownItems={
            <>
              <DropdownItem
                label="Single coupon"
                onClick={() => {
                  setCouponFormModal({})
                }}
              />
              {canUser("create", "imports") && (
                <DropdownItem
                  label="Multiple coupons"
                  onClick={() => {
                    void sdkClient.imports
                      .list({
                        filters: {
                          resource_type_eq: "coupons",
                          reference_eq: `promotion_id:${promotion.id}`,
                          status_in: ["pending", "in_progress"],
                        },
                        pageSize: 1,
                      })
                      .then((couponImports) => {
                        setCurrentImportJob(couponImports[0] ?? null)
                        setShowCouponGenerator(true)
                      })
                  }}
                />
              )}
            </>
          }
        />
      }
    >
      <Spacer top="4">
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "nowrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchBar
              initialValue={searchValue}
              onSearch={setSearchValue}
              placeholder={t("common.search")}
              onClear={() => {
                setSearchValue("")
              }}
              variant="outline"
            />
          </div>

          <Dropdown
            key={filterStatus}
            dropdownItems={filterStatusList.map((status) => (
              <DropdownItem
                key={status}
                label={filterStatusLabel[status]}
                onClick={() => {
                  setFilterStatus(status)
                }}
                icon={filterStatus === status ? "check" : "keep-space"}
              />
            ))}
            dropdownLabel={
              <Button variant="secondary" alignItems="center" size="small">
                <Text size="small" className="flex gap-1 items-center">
                  {/* the selected status replaces the label once a filter narrows the list */}
                  {filterStatus === "all"
                    ? t("apps.promotions.coupons.expiry")
                    : filterStatusLabel[filterStatus]}
                  <Icon name="caretDown" size={16} />
                </Text>
              </Button>
            }
          />
        </div>
      </Spacer>

      {couponFormModal != null && (
        <CouponFormModal
          promotionId={promotion.id}
          coupon={couponFormModal.coupon}
          onClose={(shouldReloadList) => {
            if (shouldReloadList === true) {
              refresh()
            }
            setCouponFormModal(null)
          }}
        />
      )}

      <CouponGeneratorModal
        promotion={promotion}
        show={showCouponGenerator}
        currentImportJob={currentImportJob}
        onClose={(shouldReloadList) => {
          if (shouldReloadList === true) {
            refresh()
          }
          setShowCouponGenerator(false)
        }}
        key={currentImportJob?.id}
      />
      <Spacer top="4">
        <div
          style={{
            borderWidth: "1px",
            borderBottom: 0,
            borderRadius: "var(--radius)",
            borderColor:
              list?.length == null || list.length > 0
                ? undefined
                : "transparent",
            position: "relative",
          }}
        >
          {/* fake bottom border */}
          {list?.length !== 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: -1,
                right: -1,
                height: "5px",
                borderWidth: "1px",
                borderTop: 0,
                borderBottomLeftRadius: "var(--radius)",
                borderBottomRightRadius: "var(--radius)",
                pointerEvents: "none",
                touchAction: "none",
              }}
            />
          )}
          <ResourceList
            variant="table"
            headings={[
              { label: "Code" },
              { label: "Usage" },
              { label: "Expires on" },
              { label: "" },
            ]}
            ItemTemplate={(p) => {
              return (
                <CouponRow
                  {...p}
                  deleteRule={list?.length === 1}
                  promotionId={promotion.id}
                  onEdit={(coupon) => {
                    setCouponFormModal({ coupon })
                  }}
                />
              )
            }}
          />
        </div>
        <Pagination />
      </Spacer>
    </Section>
  )
}
