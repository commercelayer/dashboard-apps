import {
  formatResourceName,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { ListableResourceType } from "@commercelayer/sdk"
import { useImportDetailsContext } from "#components/Details/Provider"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {}

export const ImportedResourceType = withSkeletonTemplate<Props>(
  ({ isLoading, delayMs, ...props }) => {
    const {
      state: { data },
    } = useImportDetailsContext()

    if (data == null) {
      return null
    }

    return (
      <span {...props}>
        {data?.resource_type != null
          ? formatResourceName({
              resource: data.resource_type as ListableResourceType,
              count: "plural",
              format: "title",
            })
          : "-"}
      </span>
    )
  },
)
