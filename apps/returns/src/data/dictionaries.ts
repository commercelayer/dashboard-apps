import { t, type TriggerAttribute } from '@commercelayer/app-elements'
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

    case 'received':
      return ['_refund']

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
  | '_refund'
>

export function getReturnTriggerAttributeName(
  triggerAttribute: UITriggerAttributes
): string {
  const dictionary: Record<typeof triggerAttribute, string> = {
    _approve: t('apps.returns.actions.approve'),
    _reject: t('apps.returns.actions.reject'),
    _cancel: t('apps.returns.actions.cancel'),
    _ship: t('apps.returns.actions.ship'),
    _receive: t('apps.returns.actions.receive'),
    _restock: t('apps.returns.actions.restock'),
    _archive: t('apps.returns.actions.archive'),
    _unarchive: t('apps.returns.actions.unarchive'),
    _refund: t('apps.returns.actions.refund')
  }

  return dictionary[triggerAttribute]
}
