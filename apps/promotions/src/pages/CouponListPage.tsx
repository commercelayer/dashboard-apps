import { CouponRow } from '#components/CouponTable'
import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  SearchBar,
  Spacer,
  useResourceList,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.couponList>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [searchValue, setSearchValue] = useState<string>()

  const { list, ResourceList } = useResourceList({
    type: 'coupons',
    query: {
      filters: {
        promotion_rule_promotion_id_eq: props.params.promotionId,
        ...(searchValue != null
          ? { code_or_coupon_recipient_email_cont: searchValue }
          : {})
      },
      sort: ['-updated_at']
    }
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
      <Spacer top='4'>
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
        <div
          style={{
            borderWidth: '1px',
            borderBottom: 0
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
            ItemTemplate={(p) => (
              <CouponRow
                {...p}
                deleteRule={list?.length === 1}
                promotionId={props.params.promotionId}
              />
            )}
          />
        </div>
      </Spacer>
    </PageLayout>
  )
}

export default Page
