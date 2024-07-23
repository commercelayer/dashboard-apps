import { Badge, type BadgeProps } from '@commercelayer/app-elements'
import { type Export } from '@commercelayer/sdk'

interface Props {
  job: Export
}

export function StatusBadge({ job }: Props): JSX.Element {
  const { variant, label } = getUiStatusVariant(job.status)
  return (
    <div>
      <Badge variant={variant}>{label}</Badge>
    </div>
  )
}

function getUiStatusVariant(apiStatus?: string): {
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
