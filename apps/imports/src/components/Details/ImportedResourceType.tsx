import { useImportDetailsContext } from '#components/Details/Provider'
import {
  formatResourceName,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { ListableResourceType } from '@commercelayer/sdk'

interface Props extends React.HTMLAttributes<HTMLSpanElement> {}

export const ImportedResourceType = withSkeletonTemplate<Props>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ isLoading, delayMs, ...props }) => {
    const {
      state: { data }
    } = useImportDetailsContext()

    if (data == null) {
      return null
    }

    return (
      <span {...props}>
        {data?.resource_type != null
          ? formatResourceName({
              resource: data.resource_type as ListableResourceType,
              count: 'plural',
              format: 'title'
            })
          : '-'}
      </span>
    )
  }
)
