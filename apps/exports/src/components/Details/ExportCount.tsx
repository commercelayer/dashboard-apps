import { useExportDetailsContext } from '#components/Details/Provider'

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  type: 'records_count'
}

export function ExportCount({ type, ...props }: Props): JSX.Element | null {
  const {
    state: { data }
  } = useExportDetailsContext()

  if (data == null) {
    return null
  }
  return <span {...props}>{data[type] ?? 0}</span>
}
