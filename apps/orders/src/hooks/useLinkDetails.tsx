import { isMockedId, makeLink } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Link } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function useLinkDetails(id: string): {
  link: Link
  isLoading: boolean
  error: any
  mutateLink: KeyedMutator<Link>
} {
  const {
    data: link,
    isLoading,
    error,
    mutate: mutateLink
  } = useCoreApi('links', 'retrieve', isMockedId(id) ? null : [id], {
    fallbackData: makeLink()
  })

  return { link, error, isLoading, mutateLink }
}
