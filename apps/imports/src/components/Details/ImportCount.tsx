import { useImportDetailsContext } from '#components/Details/Provider'

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  type: 'errors_count' | 'inputs_size' | 'processed_count' | 'warnings_count'
}

export function ImportCount({ type, ...props }: Props): JSX.Element | null {
  const {
    state: { data }
  } = useImportDetailsContext()

  if (data == null) {
    return null
  }
  return <span {...props}>{data[type] ?? 0}</span>
}
