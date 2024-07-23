import type { TriggerAttribute } from '@commercelayer/app-elements'
import type { StockTransfer, StockTransferUpdate } from '@commercelayer/sdk'

type ActionVariant = 'primary' | 'secondary'

interface TriggerAction {
  triggerAttribute: UITriggerAttributes
  variant?: ActionVariant
  hidden?: true
}

export function getStockTransferTriggerActions(
  stockTransfer: StockTransfer
): TriggerAction[] {
  switch (stockTransfer.status) {
    case 'on_hold':
      return [
        { triggerAttribute: '_cancel', variant: 'secondary' },
        { triggerAttribute: '_picking', variant: 'primary' }
      ]
    case 'picking':
      return [
        {
          triggerAttribute: '_cancel',
          hidden: true
        },
        {
          triggerAttribute: '_on_hold',
          variant: 'secondary'
        },
        {
          triggerAttribute: '_in_transit',
          variant: 'primary'
        }
      ]
    case 'in_transit':
      return [
        {
          triggerAttribute: '_cancel',
          variant: 'secondary'
        },
        {
          triggerAttribute: '_complete',
          variant: 'primary'
        }
      ]
    default:
      return []
  }
}

type UITriggerAttributes = Extract<
  TriggerAttribute<StockTransferUpdate>,
  | '_upcoming'
  | '_on_hold'
  | '_picking'
  | '_in_transit'
  | '_complete'
  | '_cancel'
>

export function getStockTransferTriggerAttributeName(
  triggerAttribute: UITriggerAttributes
): string {
  const dictionary: Record<typeof triggerAttribute, string> = {
    _upcoming: 'Mark upcoming',
    _on_hold: 'Put on hold',
    _picking: 'Start picking',
    _in_transit: 'Mark in transit',
    _complete: 'Complete',
    _cancel: 'Cancel'
  }

  return dictionary[triggerAttribute]
}
