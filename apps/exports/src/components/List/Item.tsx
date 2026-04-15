import { showResourceNiceName } from '#data/resources'
import { appRoutes } from '#data/routes'
import {
  Button,
  Icon,
  ListItem,
  RadialProgress,
  StatusIcon,
  Text,
  Tooltip,
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
  const { deleteExport, interruptExport, resumeExport } = useListContext()
  const [isActing, setIsActing] = useState(false)

  const handleAction =
    (action: () => Promise<void>) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsActing(true)
      void action().finally(() => {
        setIsActing(false)
      })
    }

  const canDelete =
    ['interrupted', 'pending', 'in_progress'].includes(job.status) &&
    canUser('destroy', 'exports')
  const canPause =
    ['pending', 'in_progress'].includes(job.status) &&
    canUser('update', 'exports')
  const canResume = job.status === 'interrupted' && canUser('update', 'exports')

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
        <div className='flex items-center gap-2'>
          {canPause && (
            <Tooltip
              label={
                <Button
                  type='button'
                  variant='secondary'
                  disabled={isActing}
                  onClick={handleAction(async () => {
                    await interruptExport(job.id)
                  })}
                  size='small'
                  aria-label='Pause export'
                >
                  <Icon name='pause' />
                </Button>
              }
              content='Pause export'
            />
          )}
          {canResume && (
            <Tooltip
              label={
                <Button
                  type='button'
                  variant='secondary'
                  disabled={isActing}
                  onClick={handleAction(async () => {
                    await resumeExport(job.id)
                  })}
                  size='small'
                  aria-label='Resume export'
                >
                  <Icon name='play' />
                </Button>
              }
              content='Resume export'
            />
          )}
          {canDelete && (
            <Button
              type='button'
              variant='secondary'
              disabled={isActing}
              onClick={handleAction(async () => {
                await deleteExport(job.id)
              })}
              size='small'
            >
              Cancel
            </Button>
          )}
        </div>
      </ListItem>
    </Link>
  )
}

function TaskIcon({ job }: { job: Export }): React.JSX.Element {
  const status = getUiStatus(job.status)

  if (status === 'progress') {
    return <RadialProgress percentage={job.progress ?? undefined} />
  }

  if (status === 'pending' || status === 'paused') {
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
