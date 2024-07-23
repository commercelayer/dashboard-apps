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
import { Link } from 'wouter'
import { getUiStatus } from './utils'
import { DescriptionLine } from './ItemDescriptionLine'
import { useListContext } from './Provider'

interface Props {
  job: Export
}

export function Item({ job }: Props): JSX.Element {
  const { canUser } = useTokenProvider()
  const { deleteExport } = useListContext()

  const canDelete = job.status === 'pending' && canUser('destroy', 'exports')

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
            variant='danger'
            onClick={() => {
              deleteExport(job.id)
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

function TaskIcon({ job }: { job: Export }): JSX.Element {
  const status = getUiStatus(job.status)

  if (status === 'progress') {
    return <RadialProgress percentage={0} />
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
