import {
  Badge,
  ListDetails,
  ListDetailsItem,
  Tag,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import isEmpty from 'lodash-es/isEmpty'
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

      <ListDetailsItem label='Includes' gutter='none'>
        {data.includes != null && data.includes.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.includes.map((inc) => (
              <Tag key={inc}>{inc}</Tag>
            ))}
          </div>
        ) : null}
      </ListDetailsItem>

      <ListDetailsItem label='Filters' gutter='none'>
        <JsonPreview json={data.filters} />
      </ListDetailsItem>

      <ListDetailsItem label='Options' gutter='none'>
        {data.dry_data === true || !isEmpty(data.fields) ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.dry_data === true && (
              <Badge variant='teal' icon='check'>
                Importable
              </Badge>
            )}
            {!isEmpty(data.fields) && (
              <Badge variant='teal' icon='check'>
                Simple format
              </Badge>
            )}
          </div>
        ) : null}
      </ListDetailsItem>
    </ListDetails>
  )
})

function JsonPreview({ json }: { json?: object | null }): React.JSX.Element {
  return (
    <pre
      style={{
        backgroundColor: '#f8f8f8', // .bg-gray-50
        overflowX: 'auto', // .overflow-x-auto
        padding: '1rem', // .p-4
        fontSize: '.75rem', // .text-xs
        borderRadius: '5px' // .rounded
      }}
    >
      {json != null && Object.keys(json).length > 0 ? (
        <>{JSON.stringify(json, null, 2)}</>
      ) : (
        <>-</>
      )}
    </pre>
  )
}
