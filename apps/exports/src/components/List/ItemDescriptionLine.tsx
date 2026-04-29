import {
  formatDate,
  formatDateWithPredicate,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Export } from "@commercelayer/sdk"
import type { FC } from "react"

interface Props {
  job: Export
}

export function DescriptionLine({ job }: Props): React.JSX.Element {
  const { user } = useTokenProvider()
  const isEtaPending =
    job.estimated_completion_at != null &&
    new Date(job.estimated_completion_at) > new Date()

  return (
    <>
      {job.status === "pending" ? (
        <div>Pending</div>
      ) : job.status === "in_progress" || job.status === "interrupted" ? (
        <div>
          {(job.records_count ?? 0).toLocaleString()} records
          {job.progress != null
            ? ` · ${job.progress}% complete`
            : " · in progress"}
          {job.status === "in_progress" && isEtaPending ? (
            <>
              {" · "}
              <RemainingTime job={job} />
            </>
          ) : job.status === "interrupted" ? (
            " · Paused"
          ) : null}
        </div>
      ) : job.status === "completed" ? (
        <div>
          {job.completed_at != null &&
            formatDateWithPredicate({
              predicate: "Exported",
              isoDate: job.completed_at,
              timezone: user?.timezone,
            })}
        </div>
      ) : job.status === "failed" ? (
        <div>Export failed</div>
      ) : (
        "-"
      )}
    </>
  )
}

const RemainingTime: FC<{
  job: Export
}> = ({ job }) => {
  const { user } = useTokenProvider()

  if (job.estimated_completion_at == null) {
    return null
  }

  const etaFullDate = formatDate({
    isoDate: job.estimated_completion_at,
    format: "full",
    timezone: user?.timezone,
  })

  const etaDistance = formatDate({
    isoDate: job.estimated_completion_at,
    format: "distanceToNow",
    timezone: user?.timezone,
  })

  return <span title={etaFullDate}>{etaDistance}</span>
}
