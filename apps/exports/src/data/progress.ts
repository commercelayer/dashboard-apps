import { formatDate } from "@commercelayer/app-elements"
import type { Export } from "@commercelayer/sdk"

/**
 * What there is to say about an export that is under way: how far it has got, and
 * either when it is expected to finish or that it was paused.
 *
 * Returned in pieces rather than as a sentence, so the table (a tooltip, joined with
 * a full stop) and the details drawer (a line, joined with a middot) can each
 * present them their own way without repeating the ETA handling.
 */
export function getProgressSummary({
  job,
  timezone,
}: {
  job: Export
  timezone?: string
}): { completed: string; expected?: string } {
  const completed = `${job.progress ?? 0}% completed`

  if (job.status === "interrupted") {
    return { completed, expected: "Paused" }
  }

  const eta = job.estimated_completion_at
  // an ETA in the past says nothing useful: the export is running late
  if (eta == null || new Date(eta) <= new Date()) {
    return { completed }
  }

  return {
    completed,
    expected: `Expected ${formatDate({
      isoDate: eta,
      format: "distanceToNow",
      timezone,
    })}`,
  }
}
