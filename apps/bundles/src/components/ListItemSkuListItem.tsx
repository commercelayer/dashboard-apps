import { makeSkuListItem } from '#mocks'
import {
  ResourceListItem,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { SkuListItem } from '@commercelayer/sdk'

interface Props {
  resource?: SkuListItem
  isLoading?: boolean
  delayMs?: number
}

export const ListItemSkuListItem = withSkeletonTemplate<Props>(
  ({
    resource = makeSkuListItem(),
    isLoading,
    delayMs
  }): JSX.Element | null => {
    return (
      <ResourceListItem
        resource={resource}
        isLoading={isLoading}
        delayMs={delayMs}
        showRightContent
      />
    )
  }
)
