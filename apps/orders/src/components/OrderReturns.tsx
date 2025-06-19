import {
  ResourceListItem,
  Section,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  returns?: Return[]
}

const returnStatuses = [
  'requested',
  'approved',
  'cancelled',
  'shipped',
  'rejected',
  'received',
  'refunded'
]

const ReturnListItem: FC<{ returnObj: Return }> = ({ returnObj }) => {
  const { canAccess } = useTokenProvider()
  const { navigateTo } = useAppLinking()

  const navigateToReturn = canAccess('customers')
    ? navigateTo({
        app: 'returns',
        resourceId: returnObj.id
      })
    : {}

  if (returnStatuses.includes(returnObj.status))
    return (
      <ResourceListItem
        key={returnObj.id}
        resource={returnObj}
        {...navigateToReturn}
      />
    )
}

function hasReturns(returns: Return[]): boolean {
  return (
    returns != null &&
    returns.length > 0 &&
    returns.filter((returnObj) => returnStatuses.includes(returnObj.status))
      .length > 0
  )
}

export const OrderReturns = withSkeletonTemplate<Props>(({ returns }) => {
  if (returns == null || !hasReturns(returns)) {
    return null
  }

  return (
    <Section title='Returns'>
      {returns.map((returnObj) => (
        <ReturnListItem key={returnObj.id} returnObj={returnObj} />
      ))}
    </Section>
  )
})
