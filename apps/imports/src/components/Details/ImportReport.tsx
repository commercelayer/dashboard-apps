import { type Import } from '@commercelayer/sdk'
import { ImportCount } from './ImportCount'
import { useImportDetailsContext } from './Provider'
import { Report, withSkeletonTemplate } from '@commercelayer/app-elements'

export const ImportReport = withSkeletonTemplate(({ isLoading }) => {
  const {
    state: { data }
  } = useImportDetailsContext()

  const errorJsonToDownload = getJsonLogToDownload(data, 'errors_log')

  return (
    <Report
      isLoading={isLoading}
      items={[
        {
          label: 'Record imported',
          count: <ImportCount type='processed_count' />,
          linkUrl: getSourceFileUrl(data),
          linkLabel: 'Download file'
        },
        {
          label: 'Errors',
          count: <ImportCount type='errors_count' />,
          downloadJsonAsFile: errorJsonToDownload?.json,
          downloadJsonFilename: errorJsonToDownload?.filename,
          linkLabel: 'View logs'
        }
      ]}
    />
  )
})

function getSourceFileUrl(job?: Import): string | undefined {
  if (
    job?.attachment_url == null ||
    job?.processed_count == null ||
    job.processed_count === 0
  ) {
    return undefined
  }
  return job.attachment_url
}

function getJsonLogToDownload(
  job: Import,
  logType: 'errors_log' | 'warnings_log'
): {
  json?: object
  filename?: string
} {
  const log = job?.[logType]

  if (job == null || log == null || Object.keys(log).length === 0) {
    return {}
  }

  return {
    json: log,
    filename: `${job.id}_${job.created_at}_${logType}.json`
  }
}
