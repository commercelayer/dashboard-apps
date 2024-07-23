import { formatDate, useTokenProvider } from '@commercelayer/app-elements'
import { type Export } from '@commercelayer/sdk'

interface Props {
  job: Export
}

export function DescriptionLine({ job }: Props): JSX.Element {
  const { user } = useTokenProvider()

  return (
    <>
      {job.status === 'pending' ? (
        <div>Pending</div>
      ) : job.status === 'in_progress' ? (
        <div>In progress</div>
      ) : job.interrupted_at != null ? (
        <div>
          Export failed on{' '}
          {formatDate({
            isoDate: job.interrupted_at,
            timezone: user?.timezone
          })}
        </div>
      ) : job.status === 'completed' ? (
        <div>
          Exported on{' '}
          {job.completed_at != null &&
            formatDate({ isoDate: job.completed_at, timezone: user?.timezone })}
        </div>
      ) : (
        '-'
      )}
    </>
  )
}
