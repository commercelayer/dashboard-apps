import { CouponRow } from '#components/CouponTable'
import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import {
  Dropdown,
  DropdownItem,
  Icon,
  PageLayout,
  SearchBar,
  Spacer,
  Text,
  useResourceList,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { QueryFilter } from '@commercelayer/sdk'
import { useMemo, useState } from 'react'
import { useLocation } from 'wouter'

type FilterStatus = 'all' | 'active' | 'expired' | 'never'
function Page(
  props: PageProps<typeof appRoutes.couponList>
): React.JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [searchValue, setSearchValue] = useState<string>()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

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
        promotion_rule_promotion_id_eq: props.params.promotionId,
        ...(searchValue != null
          ? { code_or_coupon_recipient_email_cont: searchValue }
          : {}),
        ...(filterStatusPredicate[filterStatus] ?? {})
      },
      sort: ['-updated_at'],
      pageSize: 25
    }
  }, [filterStatus, searchValue])

  const { list, ResourceList } = useResourceList({
    type: 'coupons',
    query
  })

  return (
    <PageLayout
      overlay={props.overlay}
      title='Coupons'
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Back',
        icon: 'arrowLeft',
        onClick() {
          setLocation(
            appRoutes.promotionDetails.makePath({
              promotionId: props.params.promotionId
            })
          )
        }
      }}
      toolbar={{
        buttons: [
          {
            label: 'Coupon',
            icon: 'plus',
            size: 'small',
            onClick: () => {
              setLocation(
                appRoutes.newCoupon.makePath({
                  promotionId: props.params.promotionId
                })
              )
            }
          }
        ]
      }}
    >
      <Spacer top='6'>
        <SearchBar
          initialValue={searchValue}
          onSearch={setSearchValue}
          placeholder='Search...'
          onClear={() => {
            setSearchValue('')
          }}
        />
      </Spacer>

      <Spacer top='10'>
        <Dropdown
          className='flex justify-end'
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
            <button className='items-center flex gap-2'>
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
                  className='flex gap-1 items-center'
                >
                  {filterStatusLabel[filterStatus]}
                </Text>
                <Icon name='caretDown' />
              </Text>
            </button>
          }
        />
      </Spacer>

      <Spacer top='4' bottom='8'>
        <div
          style={{
            borderWidth: '1px',
            borderBottom: 0,
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            borderColor:
              list?.length == null || list.length > 0
                ? undefined
                : 'transparent'
          }}
        >
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
                  promotionId={props.params.promotionId}
                />
              )
            }}
          />
        </div>
      </Spacer>
    </PageLayout>
  )
}

export default Page
