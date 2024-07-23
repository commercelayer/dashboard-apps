import { type Export } from '@commercelayer/sdk'
import { useExportDetailsContext } from './Provider'
import { Report, withSkeletonTemplate } from '@commercelayer/app-elements'
import { ExportCount } from './ExportCount'

export const ExportReport = withSkeletonTemplate(({ isLoading }) => {
  const {
    state: { data }
  } = useExportDetailsContext()

  if (data == null) {
    return null
  }

  const linkLabel =
    data.format === 'csv' ? 'Download CSV file' : 'Download JSON file'

  return (
    <Report
      isLoading={isLoading}
      items={[
        {
          label: getStatusLabel(data),
          count: <ExportCount type='records_count' />,
          linkUrl: getSourceFileUrl(data),
          linkLabel
        }
      ]}
    />
  )
})

function getStatusLabel(data: Export): string {
  switch (data.status) {
    case 'completed':
      return 'Records exported'

    case 'pending':
      return 'Exporting records'

    case 'in_progress':
      return 'Exporting records'

    default:
      return 'Records'
  }
}

function getSourceFileUrl(job?: Export): string | undefined {
  if (
    job?.attachment_url == null ||
    job?.records_count == null ||
    job.records_count === 0
  ) {
    return undefined
  }
  return job.attachment_url
}
