import {
  getStockTransferTriggerActions,
  getStockTransferTriggerAttributeName
} from '#data/dictionaries'
import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon
} from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk/lib/cjs/model'
import { useMemo, type FC } from 'react'

export const DetailsContextMenu: FC<{ stockTransfer: StockTransfer }> = ({
  stockTransfer
}) => {
  const { dispatch } = useTriggerAttribute(stockTransfer.id)

  const triggerMenuActions = useMemo(() => {
    return getStockTransferTriggerActions(stockTransfer)
  }, [stockTransfer])

  const { show: showCancelOverlay, Overlay: CancelOverlay } = useCancelOverlay()

  const triggerDropDownItems = triggerMenuActions
    .toReversed()
    .map((triggerAction, idx) => (
      <div key={triggerAction.triggerAttribute}>
        {idx === triggerMenuActions.length - 1 && <DropdownDivider />}
        <DropdownItem
          label={getStockTransferTriggerAttributeName(
            triggerAction.triggerAttribute
          )}
          onClick={() => {
            // cancel action has its own modal
            if (triggerAction.triggerAttribute === '_cancel') {
              showCancelOverlay()
              return
            }
            void dispatch(triggerAction.triggerAttribute)
          }}
        />
      </div>
    ))

  if (stockTransfer.status === 'completed' || triggerDropDownItems.length === 0)
    return null

  return (
    <>
      <Dropdown
        dropdownLabel={
          <Button variant='secondary' size='small'>
            <Icon name='dotsThree' size={16} weight='bold' />
          </Button>
        }
        dropdownItems={triggerDropDownItems}
      />
      <CancelOverlay
        stockTransfer={stockTransfer}
        onConfirm={() => {
          void dispatch('_cancel')
        }}
      />
    </>
  )
}
