import { formatNumber, useTokenProvider } from "@commercelayer/app-elements"
import { useExportDetailsContext } from "#components/Details/Provider"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  type: "records_count"
}

export function ExportCount({
  type,
  ...props
}: Props): React.JSX.Element | null {
  const { user } = useTokenProvider()
  const {
    state: { data },
  } = useExportDetailsContext()

  if (data == null) {
    return null
  }
  return (
    <span {...props}>
      {formatNumber({ value: data[type], locale: user?.locale })}
    </span>
  )
}
