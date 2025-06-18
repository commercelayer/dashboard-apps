import type { Import, ListResponse } from '@commercelayer/sdk'

/**
 * Checks if list contains some status that represent a progressing/temporary state
 * such as `pending` or `in_progress`. Useful to understand if polling is required.
 * @param list - The fetched import list
 * @returns `true` if a pending or progress status is found in list, otherwise `false`.
 */
export function listHasProgressingItems(list: ListResponse<Import>): boolean {
  return list.some(
    (job) =>
      job.status != null && ['pending', 'in_progress'].includes(job.status)
  )
}
