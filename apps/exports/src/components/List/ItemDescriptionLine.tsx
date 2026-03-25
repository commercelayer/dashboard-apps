import {
  formatDate,
  formatDateWithPredicate,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Export } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  job: Export & {
    progress?: number
    estimated_completion_at?: string
  }
}

export function DescriptionLine({ job }: Props): React.JSX.Element {
  const { user } = useTokenProvider()

  return (
    <>
      {job.status === 'pending' ? (
        <div>Pending</div>
      ) : job.status === 'in_progress' ? (
        <div>
          {(job.records_count ?? 0).toLocaleString()} records
          {job.progress != null
            ? ` · ${job.progress}% complete`
            : ' · in progress'}
          {job.estimated_completion_at != null ? (
            <>
              {' · '}
              <RemainingTime job={job} />
            </>
          ) : null}
        </div>
      ) : job.interrupted_at != null ? (
        <div>
          {formatDateWithPredicate({
            predicate: 'Export interrupted',
            isoDate: job.interrupted_at,
            timezone: user?.timezone
          })}
        </div>
      ) : job.status === 'completed' ? (
        <div>
          {job.completed_at != null &&
            formatDateWithPredicate({
              predicate: 'Exported',
              isoDate: job.completed_at,
              timezone: user?.timezone
            })}
        </div>
      ) : // @ts-expect-error - Waiting for SDK to update types
      job.status === 'failed' ? (
        <div>Export failed</div>
      ) : (
        '-'
      )}
    </>
  )
}

const RemainingTime: FC<{
  job: Export & { estimated_completion_at?: string }
}> = ({ job }) => {
  const { user } = useTokenProvider()

  if (job.estimated_completion_at == null) {
    return null
  }

  const etaFullDate = formatDate({
    isoDate: job.estimated_completion_at,
    format: 'full',
    timezone: user?.timezone
  })

  const etaDistance = formatDate({
    isoDate: job.estimated_completion_at,
    format: 'distanceToNow',
    timezone: user?.timezone
  })

  return <span title={etaFullDate}>({etaDistance})</span>
}
