import { isMockedId, makeTag } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Tag } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function useTagDetails(id: string): {
  tag: Tag
  isLoading: boolean
  error: any
  mutateTag: KeyedMutator<Tag>
} {
  const {
    data: tag,
    isLoading,
    error,
    mutate: mutateTag
  } = useCoreApi('tags', 'retrieve', [id], {
    isPaused: () => isMockedId(id),
    fallbackData: makeTag()
  })

  return { tag, error, isLoading, mutateTag }
}
