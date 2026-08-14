import {
  Progress,
  Report,
  Text,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Export } from "@commercelayer/sdk"
import { getProgressSummary } from "#data/progress"
import { ExportCount } from "./ExportCount"
import { useExportDetailsContext } from "./Provider"

export const ExportReport = withSkeletonTemplate(({ isLoading }) => {
  const {
    state: { data },
  } = useExportDetailsContext()

  if (data == null) {
    return null
  }

  // just "Download", as the design has it: the format is part of the export's own
  // details rather than of this label
  const linkLabel = "Download"

  return (
    <div>
      <Report
        isLoading={isLoading}
        items={[
          {
            label: "Records",
            count: <ExportCount type="records_count" />,
            // the file only exists once the export has finished, so until then the
            // block shows how far along it is instead of a link
            linkUrl: getSourceFileUrl(data),
            linkLabel,
          },
        ]}
      />
      <ExportProgress job={data} />
    </div>
  )
})

/**
 * How far a running export has got, and when it is expected to be done.
 *
 * Nothing at all once it has finished, failed or has yet to start: there is either a
 * file to download by then, or no progress worth showing.
 */
function ExportProgress({ job }: { job: Export }): React.JSX.Element | null {
  const { user } = useTokenProvider()

  if (
    (job.status !== "in_progress" && job.status !== "interrupted") ||
    job.progress == null
  ) {
    return null
  }

  const { completed, expected } = getProgressSummary({
    job,
    timezone: user?.timezone,
  })

  return (
    <div className="flex flex-col gap-2">
      <Progress value={job.progress} max={100} displayMode="none">
        {job.progress}%
      </Progress>
      <Text size="small" weight="semibold" variant="info">
        {[completed, expected].filter(Boolean).join(" · ")}
      </Text>
    </div>
  )
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
