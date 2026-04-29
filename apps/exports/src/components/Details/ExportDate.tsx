import {
  formatDate,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import { useExportDetailsContext } from "#components/Details/Provider"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  atType: "started_at" | "completed_at" | "interrupted_at"
  prefixText?: string
  includeTime?: boolean
}

export const ExportDate = withSkeletonTemplate<Props>(
  ({ atType, prefixText, includeTime, isLoading, delayMs, ...props }) => {
    const {
      state: { data },
    } = useExportDetailsContext()

    const { user } = useTokenProvider()

    if (data == null) {
      return null
    }

    const dateAt = data[atType]
    return (
      <span {...props}>
        {prefixText}{" "}
        {dateAt != null &&
          formatDate({
            isoDate: dateAt,
            format: includeTime === true ? "full" : "date",
            timezone: user?.timezone,
          })}
      </span>
    )
  },
)
