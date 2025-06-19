import {
  ListDetails,
  ListDetailsItem,
  formatDate,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { useImportDetailsContext } from './Provider'
import { RowParentResource } from './RowParentResource'
import { StatusBadge } from './StatusBadge'

export const ImportDetails = withSkeletonTemplate(({ isLoading }) => {
  const {
    state: { data }
  } = useImportDetailsContext()

  const { user } = useTokenProvider()

  if (data == null) {
    return null
  }

  return (
    <ListDetails title='Info' isLoading={isLoading}>
      <RowParentResource />
      {data.status != null ? (
        <ListDetailsItem label='Status' gutter='none'>
          <StatusBadge job={data} />
        </ListDetailsItem>
      ) : null}
      {data.processed_count != null && data.inputs_size != null ? (
        <ListDetailsItem label='Processed' gutter='none'>
          {data.processed_count}/{data.inputs_size}
        </ListDetailsItem>
      ) : null}
      {data.completed_at != null ? (
        <ListDetailsItem label='Completed at' gutter='none'>
          {formatDate({
            isoDate: data.completed_at,
            format: 'fullWithSeconds',
            timezone: user?.timezone,
            showCurrentYear: true
          })}
        </ListDetailsItem>
      ) : null}
      {data.updated_at != null && data.completed_at == null ? (
        <ListDetailsItem label='Last update' gutter='none'>
          {formatDate({
            isoDate: data.updated_at,
            format: 'fullWithSeconds',
            timezone: user?.timezone,
            showCurrentYear: true
          })}
        </ListDetailsItem>
      ) : null}
    </ListDetails>
  )
})
