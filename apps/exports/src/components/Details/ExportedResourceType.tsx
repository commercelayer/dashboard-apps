import { useExportDetailsContext } from '#components/Details/Provider'
import { showResourceNiceName } from '#data/resources'
import { withSkeletonTemplate } from '@commercelayer/app-elements'

interface Props extends React.HTMLAttributes<HTMLSpanElement> {}

export const ExportedResourceType = withSkeletonTemplate<Props>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ isLoading, delayMs, ...props }) => {
    const {
      state: { data }
    } = useExportDetailsContext()

    if (data == null) {
      return null
    }

    return <span {...props}>{showResourceNiceName(data?.resource_type)}</span>
  }
)
