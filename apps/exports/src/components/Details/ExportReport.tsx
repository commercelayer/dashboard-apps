import { Report, withSkeletonTemplate } from '@commercelayer/app-elements'
import { type Export } from '@commercelayer/sdk'
import { ExportCount } from './ExportCount'
import { useExportDetailsContext } from './Provider'

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
          label: 'Records',
          count: <ExportCount type='records_count' />,
          linkUrl: getSourceFileUrl(data),
          linkLabel
        }
      ]}
    />
  )
})

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
