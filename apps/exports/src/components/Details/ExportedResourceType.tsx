import { withSkeletonTemplate } from "@commercelayer/app-elements"
import { useExportDetailsContext } from "#components/Details/Provider"
import { showResourceNiceName } from "#data/resources"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {}

export const ExportedResourceType = withSkeletonTemplate<Props>(
  ({ isLoading, delayMs, ...props }) => {
    const {
      state: { data },
    } = useExportDetailsContext()

    if (data == null) {
      return null
    }

    // just the name: the status badge is rendered by the page, after the word
    // "export", rather than in the middle of the title
    return <span {...props}>{showResourceNiceName(data?.resource_type)}</span>
  },
)
