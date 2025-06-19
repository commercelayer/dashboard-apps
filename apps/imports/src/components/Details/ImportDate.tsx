import { useImportDetailsContext } from '#components/Details/Provider'
import {
  formatDateWithPredicate,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  atType:
    | 'completed_at'
    | 'created_at'
    | 'interrupted_at'
    | 'started_at'
    | 'updated_at'
  includeTime?: boolean
}

export const ImportDate = withSkeletonTemplate<Props>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ atType, includeTime, isLoading, delayMs, ...props }) => {
    const {
      state: { data }
    } = useImportDetailsContext()

    const { user } = useTokenProvider()

    if (data == null) {
      return null
    }

    const dateAt = data[atType]
    return (
      <span {...props}>
        {dateAt != null &&
          formatDateWithPredicate({
            predicate: 'Imported',
            isoDate: dateAt,
            format: includeTime === true ? 'full' : 'date',
            timezone: user?.timezone
          })}
      </span>
    )
  }
)
