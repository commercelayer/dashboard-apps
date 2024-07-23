import {
  ResourceAddress,
  Section,
  Stack,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'

interface Props {
  returnObj: Return
}

export const ReturnAddresses = withSkeletonTemplate<Props>(
  ({ returnObj }): JSX.Element | null => {
    if (
      returnObj.origin_address == null ||
      returnObj.destination_address == null
    ) {
      return null
    }

    return (
      <>
        <Section title='Addresses' border='none'>
          <Stack>
            <ResourceAddress
              resource={returnObj.origin_address}
              title='Origin'
            />
            <ResourceAddress
              resource={returnObj.destination_address}
              title='Destination'
            />
          </Stack>
        </Section>
      </>
    )
  }
)
