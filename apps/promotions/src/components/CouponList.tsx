import { CouponGeneratorModal } from '#components/CouponGeneratorModal'
import { CouponRow } from '#components/CouponTable'
import { appRoutes } from '#data/routes'
import type { Promotion } from '#types'
import {
  Button,
  Dropdown,
  DropdownItem,
  Icon,
  SearchBar,
  Spacer,
  Text,
  useCoreSdkProvider,
  useResourceList,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Import, QueryFilter } from '@commercelayer/sdk'
import { type FC, useMemo, useState } from 'react'
import { useLocation } from 'wouter'

type FilterStatus = 'all' | 'active' | 'expired' | 'never'

interface CouponListProps {
  promotion: Promotion
}
export const CouponList: FC<CouponListProps> = ({ promotion }) => {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [showCouponGenerator, setShowCouponGenerator] = useState(false)
  const [searchValue, setSearchValue] = useState<string>()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const { sdkClient } = useCoreSdkProvider()
  const [currentImportJob, setCurrentImportJob] = useState<Import | null>(null)

  const filterStatusLabel: Record<FilterStatus, string> = {
    all: 'All',
    active: 'Active',
    expired: 'Expired',
    never: 'Never expire'
  }

  const filterStatusList: FilterStatus[] = ['all', 'active', 'expired', 'never']

  const filterStatusPredicate: Record<FilterStatus, QueryFilter> = {
    all: {},
    active: { expires_at_gt: new Date().toJSON() },
    expired: { expires_at_lt: new Date().toJSON() },
    never: { expires_at_null: true }
  }

  const query = useMemo<Parameters<typeof useResourceList>[0]['query']>(() => {
    return {
      filters: {
        promotion_rule_promotion_id_eq: promotion.id,
        ...(searchValue != null
          ? { code_or_coupon_recipient_email_cont: searchValue }
          : {}),
        ...(filterStatusPredicate[filterStatus] ?? {})
      },
      sort: ['-updated_at'],
      pageSize: 25
    }
  }, [filterStatus, searchValue])

  const { list, ResourceList, refresh } = useResourceList({
    type: 'coupons',
    query
  })

  const addCouponLink = appRoutes.newCoupon.makePath({
    promotionId: promotion.id
  })

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'nowrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchBar
            initialValue={searchValue}
            onSearch={setSearchValue}
            placeholder='Search…'
            onClear={() => {
              setSearchValue('')
            }}
            variant='outline'
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
              icon={filterStatus === status ? 'check' : 'keep-space'}
            />
          ))}
          dropdownLabel={
            <Button variant='secondary' alignItems='center' size='small'>
              <Text
                variant='info'
                size='small'
                className='flex gap-1 items-center'
              >
                View:{' '}
                <Text
                  variant='primary'
                  weight='semibold'
                  size='small'
                  className='flex gap-1 items-center '
                >
                  {filterStatusLabel[filterStatus]}
                </Text>
                <Icon name='caretDown' size={16} />
              </Text>
            </Button>
          }
        />

        <Dropdown
          dropdownLabel={
            <Button
              alignItems='center'
              size='small'
              variant='secondary'
              onClick={() => {
                setLocation(addCouponLink)
              }}
            >
              <Icon name='plus' size={16} />
              New
            </Button>
          }
          dropdownItems={
            <>
              <DropdownItem
                label='Single coupon'
                onClick={() => {
                  setLocation(addCouponLink)
                }}
              />
              {canUser('create', 'imports') && (
                <DropdownItem
                  label='Multiple coupons'
                  onClick={() => {
                    void sdkClient.imports
                      .list({
                        filters: {
                          resource_type_eq: 'coupons',
                          reference_eq: `promotion_id:${promotion.id}`,
                          status_in: ['pending', 'in_progress']
                        },
                        pageSize: 1
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
      </div>

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
      />

      <Spacer top='4' bottom='8'>
        <div
          style={{
            borderWidth: '1px',
            borderBottom: 0,
            borderRadius: 'var(--radius)',
            borderColor:
              list?.length == null || list.length > 0
                ? undefined
                : 'transparent',
            position: 'relative'
          }}
        >
          {/* fake bottom border */}
          {list?.length !== 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: -1,
                right: -1,
                height: '5px',
                borderWidth: '1px',
                borderTop: 0,
                borderBottomLeftRadius: 'var(--radius)',
                borderBottomRightRadius: 'var(--radius)',
                pointerEvents: 'none',
                touchAction: 'none'
              }}
            />
          )}
          <ResourceList
            variant='table'
            headings={[
              { label: 'Code' },
              { label: 'Used' },
              { label: 'Expiry' },
              { label: '' }
            ]}
            ItemTemplate={(p) => {
              return (
                <CouponRow
                  {...p}
                  deleteRule={list?.length === 1}
                  promotionId={promotion.id}
                />
              )
            }}
          />
        </div>
      </Spacer>
    </>
  )
}
