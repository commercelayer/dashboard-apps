import {
  ListDetails,
  ListDetailsItem,
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
    <ListDetails title='Info' isLoading={isLoading}>
      {data.status != null ? (
        <ListDetailsItem label='Status' gutter='none'>
          <StatusBadge job={data} />
        </ListDetailsItem>
      ) : null}
      {data.includes != null && data.includes.length > 0 ? (
        <ListDetailsItem label='Includes' gutter='none'>
          {data.includes.join(', ')}
        </ListDetailsItem>
      ) : null}

      <ListDetailsItem label='Filters' gutter='none'>
        <JsonPreview json={data.filters} />
      </ListDetailsItem>
      <ListDetailsItem label='Dry Data' gutter='none'>
        {data.dry_data === true ? 'true' : 'false'}
      </ListDetailsItem>
      <ListDetailsItem label='Format' gutter='none'>
        {data.format}
      </ListDetailsItem>
    </ListDetails>
  )
})

function JsonPreview({ json }: { json?: object | null }): React.JSX.Element {
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
