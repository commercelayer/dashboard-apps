import { Badge, type BadgeProps } from '@commercelayer/app-elements'
import { type Export } from '@commercelayer/sdk'

interface Props {
  job: Export
  className?: string
}

export function StatusBadge({ job, className }: Props): React.JSX.Element {
  const { variant, label } = getUiStatusVariant(job.status)
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

function getUiStatusVariant(apiStatus?: string): {
  variant: BadgeProps['variant']
  label: string
} {
  if (apiStatus === 'in_progress') {
    return {
      variant: 'warning',
      label: 'in progress'
    }
  }

  if (apiStatus === 'interrupted') {
    return {
      variant: 'warning',
      label: 'paused'
    }
  }

  if (apiStatus === 'failed') {
    return {
      variant: 'danger',
      label: 'failed'
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
