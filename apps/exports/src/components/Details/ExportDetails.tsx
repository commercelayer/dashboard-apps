import {
  ListDetailsItem,
  ListDetails,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { useExportDetailsContext } from './Provider'
import { StatusBadge } from './StatusBadge'

export const ExportDetails = withSkeletonTemplate(({ isLoading }) => {
  const {
    state: { data }
  } = useExportDetailsContext()

  if (data == null) {
    return null
  }

  return (
    <ListDetails title='Details' isLoading={isLoading}>
      {data.status != null ? (
        <ListDetailsItem label='Status'>
          <StatusBadge job={data} />
        </ListDetailsItem>
      ) : null}
      {data.includes != null && data.includes.length > 0 ? (
        <ListDetailsItem label='Includes'>
          {data.includes.join(', ')}
        </ListDetailsItem>
      ) : null}

      <ListDetailsItem label='Filters'>
        <JsonPreview json={data.filters} />
      </ListDetailsItem>
      <ListDetailsItem label='Dry Data'>
        {data.dry_data === true ? 'true' : 'false'}
      </ListDetailsItem>
      <ListDetailsItem label='Format'>{data.format}</ListDetailsItem>
    </ListDetails>
  )
})

function JsonPreview({ json }: { json?: object | null }): JSX.Element {
  return (
    <pre>
      {json != null && Object.keys(json).length > 0 ? (
        <>{JSON.stringify(json, null, 2)}</>
      ) : (
        <>-</>
      )}
    </pre>
  )
}
