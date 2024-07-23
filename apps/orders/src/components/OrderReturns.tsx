import {
  ResourceListItem,
  Section,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'

interface Props {
  returns?: Return[]
}

const returnStatuses = [
  'requested',
  'approved',
  'cancelled',
  'shipped',
  'rejected',
  'received'
]

const renderReturn: React.FC<Return> = (returnObj) => {
  const {
    canAccess,
    settings: { mode }
  } = useTokenProvider()

  const navigateToReturn = canAccess('customers')
    ? navigateTo({
        destination: {
          app: 'returns',
          resourceId: returnObj.id,
          mode
        }
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
      {returns.map((returnObj) => renderReturn(returnObj))}
    </Section>
  )
})
