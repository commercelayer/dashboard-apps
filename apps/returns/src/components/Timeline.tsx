import { useReturnDetails } from '#hooks/useReturnDetails'
import {
  Legend,
  Spacer,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'
import { ReturnTimeline } from './ReturnTimeline'

interface Props {
  returnObj: Return
}

export const Timeline = withSkeletonTemplate<Props>(({ returnObj }) => {
  const { isValidating } = useReturnDetails(returnObj.id)

  return (
    <>
      <Legend title='Timeline' />
      <Spacer top='8'>
        <ReturnTimeline
          returnId={returnObj.id}
          refresh={isValidating}
          attachmentOption={{
            referenceOrigin: 'app-returns--note'
          }}
        />
      </Spacer>
    </>
  )
})
