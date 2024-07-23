import {
  getStockTransferTriggerActions,
  getStockTransferTriggerAttributeName
} from '#data/dictionaries'
import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  ActionButtons,
  ResourceLineItems,
  Section,
  Spacer,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk'

interface Props {
  stockTransfer: StockTransfer
}

export const StockTransferSummary = withSkeletonTemplate<Props>(
  ({ stockTransfer }): JSX.Element => {
    const triggerActions = getStockTransferTriggerActions(stockTransfer).filter(
      (action) => action.hidden == null
    )

    const { isLoading, errors, dispatch } = useTriggerAttribute(
      stockTransfer.id
    )

    const { show: showCancelOverlay, Overlay: CancelOverlay } =
      useCancelOverlay()

    if (stockTransfer.line_item == null) return <></>

    const lineItem = stockTransfer.line_item
    lineItem.formatted_total_amount = null
    lineItem.formatted_unit_amount = null

    return (
      <Section title='Stock items'>
        <ResourceLineItems editable={false} items={[lineItem]} />
        <ActionButtons
          actions={triggerActions.map((triggerAction) => {
            return {
              label: getStockTransferTriggerAttributeName(
                triggerAction.triggerAttribute
              ),
              variant: triggerAction.variant,
              disabled: isLoading,
              onClick: () => {
                if (triggerAction.triggerAttribute === '_cancel') {
                  showCancelOverlay()
                  return
                }

                void dispatch(triggerAction.triggerAttribute)
              }
            }
          })}
        />
        {renderErrorMessages(errors)}
        <CancelOverlay
          stockTransfer={stockTransfer}
          onConfirm={() => {
            void dispatch('_cancel')
          }}
        />
      </Section>
    )
  }
)

function renderErrorMessages(errors?: string[]): JSX.Element {
  return errors != null && errors.length > 0 ? (
    <Spacer top='4'>
      {errors.map((message, idx) => (
        <Text key={idx} variant='danger'>
          {message}
        </Text>
      ))}
    </Spacer>
  ) : (
    <></>
  )
}
