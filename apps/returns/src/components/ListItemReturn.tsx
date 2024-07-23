import { makeReturn } from '#mocks'
import { ResourceListItem, navigateTo } from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

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
  const [, setLocation] = useLocation()

  return (
    <ResourceListItem
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        setLocation,
        destination: {
          app: 'returns',
          resourceId: resource.id
        }
      })}
    />
  )
}
