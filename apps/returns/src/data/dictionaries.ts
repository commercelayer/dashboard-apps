import type { TriggerAttribute } from '@commercelayer/app-elements'
import type { Return, ReturnUpdate } from '@commercelayer/sdk'

export function getReturnTriggerAttributes(
  returnObj: Return
): UITriggerAttributes[] {
  const archiveTriggerAttribute: Extract<
    UITriggerAttributes,
    '_archive' | '_unarchive'
  > = returnObj.archived_at == null ? '_archive' : '_unarchive'

  switch (returnObj.status) {
    case 'requested':
      return ['_approve', '_cancel']

    case 'approved':
      return ['_ship']

    case 'shipped':
      return ['_receive', '_reject']

    case 'cancelled':
      return [archiveTriggerAttribute]

    default:
      return []
  }
}

type UITriggerAttributes = Extract<
  TriggerAttribute<ReturnUpdate>,
  | '_approve'
  | '_cancel'
  | '_ship'
  | '_reject'
  | '_receive'
  | '_restock'
  | '_archive'
  | '_unarchive'
>

export function getReturnTriggerAttributeName(
  triggerAttribute: UITriggerAttributes
): string {
  const dictionary: Record<typeof triggerAttribute, string> = {
    _approve: 'Approve',
    _reject: 'Reject',
    _cancel: 'Cancel',
    _ship: 'Mark shipped',
    _receive: 'Receive',
    _restock: 'Restock',
    _archive: 'Archive',
    _unarchive: 'Unarchive'
  }

  return dictionary[triggerAttribute]
}
