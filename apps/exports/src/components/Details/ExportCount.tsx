import { useExportDetailsContext } from "#components/Details/Provider"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  type: "records_count"
}

export function ExportCount({
  type,
  ...props
}: Props): React.JSX.Element | null {
  const {
    state: { data },
  } = useExportDetailsContext()

  if (data == null) {
    return null
  }
  const value = data[type] ?? 0
  const formattedValue = new Intl.NumberFormat().format(value)
  return <span {...props}>{formattedValue}</span>
}
