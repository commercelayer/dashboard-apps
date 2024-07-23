import {
  ListDetailsItem,
  ListDetails,
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
    <ListDetails title='Details' isLoading={isLoading}>
      <RowParentResource />
      {data.status != null ? (
        <ListDetailsItem label='Status'>
          <StatusBadge job={data} />
        </ListDetailsItem>
      ) : null}
      {data.completed_at != null ? (
        <ListDetailsItem label='Completed at'>
          {formatDate({
            isoDate: data.completed_at,
            format: 'fullWithSeconds',
            timezone: user?.timezone
          })}
        </ListDetailsItem>
      ) : null}
      {data.updated_at != null && data.completed_at == null ? (
        <ListDetailsItem label='Last update'>
          {formatDate({
            isoDate: data.updated_at,
            format: 'fullWithSeconds',
            timezone: user?.timezone
          })}
        </ListDetailsItem>
      ) : null}
    </ListDetails>
  )
})
