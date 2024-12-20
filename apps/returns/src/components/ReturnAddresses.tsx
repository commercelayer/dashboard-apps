import {
  ResourceAddress,
  Section,
  Stack,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'

interface Props {
  returnObj: Return
}

export const ReturnAddresses = withSkeletonTemplate<Props>(
  ({ returnObj }): JSX.Element | null => {
    const { t } = useTranslation()

    if (
      returnObj.origin_address == null ||
      returnObj.destination_address == null
    ) {
      return null
    }

    return (
      <>
        <Section title={t('resources.addresses.name_other')} border='none'>
          <Stack>
            <ResourceAddress
              address={returnObj.origin_address}
              title={t('apps.returns.details.origin')}
            />
            <ResourceAddress
              address={returnObj.destination_address}
              title={t('apps.returns.details.destination')}
            />
          </Stack>
        </Section>
      </>
    )
  }
)
