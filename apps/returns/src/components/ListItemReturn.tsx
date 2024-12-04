import { makeReturn } from '#mocks'
import { ResourceListItem, useAppLinking } from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'

interface Props {
  resource?: Return
  isLoading?: boolean
  delayMs?: number
}

export function ListItemReturn({
  resource = makeReturn(),
  isLoading,
  delayMs
}: Props): JSX.Element {
  const { navigateTo } = useAppLinking()

  return (
    <ResourceListItem
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        app: 'returns',
        resourceId: resource.id
      })}
    />
  )
}
