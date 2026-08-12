import {
  ActionButtons,
  ResourceLineItems,
  Section,
  Spacer,
  Text,
  useConfirmDialog,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { StockTransfer } from "@commercelayer/sdk"
import {
  getStockTransferTriggerActions,
  getStockTransferTriggerAttributeName,
} from "#data/dictionaries"
import { useTriggerAttribute } from "#hooks/useTriggerAttribute"

interface Props {
  stockTransfer: StockTransfer
}

export const StockTransferSummary = withSkeletonTemplate<Props>(
  ({ stockTransfer }): React.JSX.Element => {
    const triggerActions = getStockTransferTriggerActions(stockTransfer).filter(
      (action) => action.hidden == null,
    )

    const { isLoading, errors, dispatch } = useTriggerAttribute(
      stockTransfer.id,
    )

    const { show: showCancelDialog, ConfirmDialog } = useConfirmDialog()

    if (stockTransfer.line_item == null) return <></>

    const lineItem = stockTransfer.line_item
    lineItem.formatted_total_amount = null
    lineItem.formatted_unit_amount = null
    lineItem.quantity = stockTransfer.quantity

    return (
      <Section title="Stock items">
        <ResourceLineItems editable={false} items={[lineItem]} />
        <div className="print:hidden">
          <ActionButtons
            actions={triggerActions.map((triggerAction) => {
              return {
                label: getStockTransferTriggerAttributeName(
                  triggerAction.triggerAttribute,
                ),
                variant: triggerAction.variant,
                disabled: isLoading,
                onClick: () => {
                  if (triggerAction.triggerAttribute === "_cancel") {
                    showCancelDialog()
                    return
                  }

                  void dispatch(triggerAction.triggerAttribute)
                },
              }
            })}
          />
        </div>
        {renderErrorMessages(errors)}
        <ConfirmDialog
          icon="x"
          title={`Cancel stock transfer #${stockTransfer.number}`}
          description="This action cannot be undone."
          confirm={{
            // not just "Cancel": the dialog's own dismiss button says that
            label: getStockTransferTriggerAttributeName("_cancel"),
            variant: "danger",
            onClick: async () => {
              await dispatch("_cancel")
            },
          }}
          cancelLabel="Close"
        />
      </Section>
    )
  },
)

function renderErrorMessages(errors?: string[]): React.JSX.Element {
  return errors != null && errors.length > 0 ? (
    <Spacer top="4">
      {errors.map((message) => (
        <Text key={message} variant="danger">
          {message}
        </Text>
      ))}
    </Spacer>
  ) : (
    <></>
  )
}
