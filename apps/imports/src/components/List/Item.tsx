import { DescriptionLine } from '#components/List/ItemDescriptionLine'
import { getUiStatus } from '#components/List/utils'
import { appRoutes } from '#data/routes'
import { getProgressPercentage } from '#utils/getProgressPercentage'
import {
  Button,
  formatResourceName,
  Icon,
  ListItem,
  RadialProgress,
  StatusIcon,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import {
  CommerceLayerStatic,
  type Import,
  type ListableResourceType
} from '@commercelayer/sdk'
import { useState } from 'react'
import { Link } from 'wouter'
import { useListContext } from './Provider'

interface Props {
  job: Import
}

export function Item({ job }: Props): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { deleteImport } = useListContext()
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>()

  const canDelete =
    (job.status === 'pending' || job.status === 'interrupted') &&
    canUser('destroy', 'imports')

  return (
    <Link href={appRoutes.details.makePath(job.id)} asChild>
      <ListItem icon={<TaskIcon job={job} />}>
        <div>
          <Text tag='div' weight='semibold'>
            {formatResourceName({
              resource: job.resource_type as ListableResourceType,
              count: 'plural',
              format: 'title'
            })}
          </Text>
          <Text tag='div' size='small' variant='info' weight='medium'>
            <DescriptionLine job={job} />
          </Text>
          {deleteErrorMessage != null && (
            <Text variant='danger' size='small'>
              {deleteErrorMessage}
            </Text>
          )}
        </div>
        {canDelete ? (
          <div>
            <Button
              variant='danger'
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setDeleteErrorMessage(null)
                deleteImport(job.id).catch((error) => {
                  setDeleteErrorMessage(
                    CommerceLayerStatic.isApiError(error)
                      ? error.errors.map((e) => e.detail).join(', ')
                      : 'Could not delete'
                  )
                })
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Icon name='caretRight' />
        )}
      </ListItem>
    </Link>
  )
}

function TaskIcon({ job }: { job: Import }): React.JSX.Element {
  const status = getUiStatus(job.status)
  if (status === 'progress') {
    return <RadialProgress percentage={getProgressPercentage(job)?.value} />
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
