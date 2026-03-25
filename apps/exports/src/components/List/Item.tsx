import { showResourceNiceName } from '#data/resources'
import { appRoutes } from '#data/routes'
import {
  Button,
  Icon,
  ListItem,
  RadialProgress,
  StatusIcon,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Export } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link } from 'wouter'
import { DescriptionLine } from './ItemDescriptionLine'
import { useListContext } from './Provider'
import { getUiStatus } from './utils'

interface Props {
  job: Export
}

export function Item({ job }: Props): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { deleteExport } = useListContext()
  const [isDeleting, setIsDeleting] = useState(false)

  const canDelete =
    (job.status === 'pending' || job.status === 'in_progress') &&
    canUser('destroy', 'exports')

  return (
    <Link href={appRoutes.details.makePath(job.id)} asChild>
      <ListItem icon={<TaskIcon job={job} />}>
        <div>
          <Text tag='div' weight='semibold'>
            {showResourceNiceName(job.resource_type)}
          </Text>
          <Text tag='div' size='small' variant='info' weight='medium'>
            <DescriptionLine job={job} />
          </Text>
        </div>
        {canDelete ? (
          <Button
            type='button'
            variant='secondary'
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDeleting(true)
              void deleteExport(job.id).finally(() => {
                setIsDeleting(false)
              })
            }}
          >
            Cancel
          </Button>
        ) : (
          <Icon name='caretRight' />
        )}
      </ListItem>
    </Link>
  )
}

function TaskIcon({
  job
}: {
  job: Export & { progress?: number }
}): React.JSX.Element {
  const status = getUiStatus(job.status)

  if (status === 'progress') {
    return <RadialProgress percentage={job.progress} />
  }

  if (status === 'pending') {
    return <RadialProgress />
  }

  if (status === 'danger') {
    return <StatusIcon gap='large' name='x' background='red' />
  }

  if (status === 'success') {
    return <StatusIcon gap='large' name='check' background='green' />
  }

  return <StatusIcon gap='large' name='minus' background='gray' />
}
