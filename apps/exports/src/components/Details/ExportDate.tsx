import { useExportDetailsContext } from '#components/Details/Provider'
import {
  formatDate,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  atType: 'started_at' | 'completed_at' | 'interrupted_at'
  prefixText?: string
  includeTime?: boolean
}

export const ExportDate = withSkeletonTemplate<Props>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ atType, prefixText, includeTime, isLoading, delayMs, ...props }) => {
    const {
      state: { data }
    } = useExportDetailsContext()

    const { user } = useTokenProvider()

    if (data == null) {
      return null
    }

    const dateAt = data[atType]
    return (
      <span {...props}>
        {prefixText}{' '}
        {dateAt != null &&
          formatDate({
            isoDate: dateAt,
            format: includeTime === true ? 'full' : 'date',
            timezone: user?.timezone
          })}
      </span>
    )
  }
)
