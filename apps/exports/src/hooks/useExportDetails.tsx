import { useCoreApi } from "@commercelayer/app-elements"
import type { Export } from "@commercelayer/sdk"
import type { KeyedMutator } from "swr"
import { makeExport } from "#mocks"

const POLLING_INTERVAL = 4000
export const statusForPolling: Array<Export["status"]> = [
  "pending",
  "in_progress",
]

export function useExportDetails(id: string): {
  data: Export
  isLoading: boolean
  error: any
  mutate: KeyedMutator<Export>
}
export function useExportDetails(id: string | null): {
  data: Export | undefined
  isLoading: boolean
  error: any
  mutate: KeyedMutator<Export>
}
export function useExportDetails(id: string | null): {
  data: Export | undefined
  isLoading: boolean
  error: any
  mutate: KeyedMutator<Export>
} {
  const { data, isLoading, error, mutate } = useCoreApi(
    "exports",
    "retrieve",
    id == null ? null : [id],
    {
      fallbackData: id == null ? undefined : makeExport(),
      refreshInterval: (job) =>
        job?.status != null && statusForPolling.includes(job.status)
          ? POLLING_INTERVAL
          : 0,
    },
  )

  return { data, isLoading, error, mutate }
}
