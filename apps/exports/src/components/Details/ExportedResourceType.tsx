import { withSkeletonTemplate } from "@commercelayer/app-elements"
import { useExportDetailsContext } from "#components/Details/Provider"
import { showResourceNiceName } from "#data/resources"
import { StatusBadge } from "./StatusBadge"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {}

export const ExportedResourceType = withSkeletonTemplate<Props>(
  ({ isLoading, delayMs, ...props }) => {
    const {
      state: { data },
    } = useExportDetailsContext()

    if (data == null) {
      return null
    }

    return (
      <span {...props}>
        {showResourceNiceName(data?.resource_type)}

        <StatusBadge job={data} className="inline-block align-middle ml-2" />
      </span>
    )
  },
)
