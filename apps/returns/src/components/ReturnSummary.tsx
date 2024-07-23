import {
  getReturnTriggerAttributeName,
  getReturnTriggerAttributes
} from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useRestockableList } from '#hooks/useRestockableList'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  ActionButtons,
  Button,
  ResourceLineItems,
  Section,
  Spacer,
  Text,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  returnObj: Return
}

export const ReturnSummary = withSkeletonTemplate<Props>(
  ({ returnObj }): JSX.Element => {
    const { canUser } = useTokenProvider()
    const triggerAttributes = getReturnTriggerAttributes(returnObj)

    const { isLoading, errors, dispatch } = useTriggerAttribute(returnObj.id)

    const { show: showCancelOverlay, Overlay: CancelOverlay } =
      useCancelOverlay()

    const [, setLocation] = useLocation()
    const restockableList = useRestockableList(returnObj)

    if (returnObj.return_line_items?.length === 0) return <></>

    return (
      <Section
        title='Items'
        actionButton={
          returnObj.status === 'received' &&
          restockableList.length > 0 &&
          canUser('update', 'return_line_items') && (
            <Button
              variant='secondary'
              size='mini'
              onClick={() => {
                setLocation(appRoutes.restock.makePath(returnObj.id))
              }}
            >
              Restock
            </Button>
          )
        }
      >
        <ResourceLineItems
          editable={false}
          items={returnObj.return_line_items ?? []}
        />
        {canUser('update', 'returns') && (
          <ActionButtons
            actions={triggerAttributes.map((triggerAttribute) => {
              return {
                label: getReturnTriggerAttributeName(triggerAttribute),
                variant:
                  triggerAttribute === '_cancel' ||
                  triggerAttribute === '_reject'
                    ? 'secondary'
                    : 'primary',
                disabled: isLoading,
                onClick: () => {
                  if (triggerAttribute === '_cancel') {
                    showCancelOverlay()
                    return
                  }

                  void dispatch(triggerAttribute)
                }
              }
            })}
          />
        )}
        {renderErrorMessages(errors)}
        <CancelOverlay
          returnObj={returnObj}
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
