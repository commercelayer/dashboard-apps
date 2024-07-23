import { TableData, ErrorBoundary } from '@commercelayer/app-elements'
import type { JsonObject } from 'type-fest'

interface Props {
  title: string
  data: JsonObject[]
  limit: number
}

export function ImportPreview({ title, data, limit }: Props): JSX.Element {
  return (
    <ErrorBoundary
      errorTitle='We were unable to show the preview'
      errorDescription='Try to upload a different file'
    >
      <TableData title={title} data={data} limit={limit} showTotal />
    </ErrorBoundary>
  )
}
