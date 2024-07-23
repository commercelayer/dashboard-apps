import { Badge, type BadgeProps } from '@commercelayer/app-elements'
import { type Import } from '@commercelayer/sdk'

interface Props {
  job: Import
}

export function StatusBadge({ job }: Props): JSX.Element {
  const errorsCount =
    job.errors_count != null && job.errors_count > 0
      ? job.errors_count
      : undefined

  const { variant, label } = getUiStatusVariant(job.status, errorsCount)

  return (
    <div>
      <Badge variant={variant}>{label}</Badge>
    </div>
  )
}

function getUiStatusVariant(
  apiStatus?: string,
  errorsCount?: number
): {
  variant: BadgeProps['variant']
  label: string
} {
  if (apiStatus === 'in_progress') {
    return {
      variant: 'primary',
      label: 'in progress'
    }
  }

  if (apiStatus === 'interrupted') {
    return {
      variant: 'danger',
      label: 'interrupted'
    }
  }

  if (apiStatus === 'completed' && errorsCount != null) {
    return {
      variant: 'warning',
      label: 'completed with errors'
    }
  }

  if (apiStatus === 'completed') {
    return {
      variant: 'success',
      label: 'completed'
    }
  }

  if (apiStatus === 'pending') {
    return {
      variant: 'secondary',
      label: 'pending'
    }
  }

  return {
    variant: 'secondary',
    label: apiStatus ?? 'N/A'
  }
}
