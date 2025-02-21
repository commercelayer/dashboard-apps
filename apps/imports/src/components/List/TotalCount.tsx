import { useListContext } from './Provider'

export function TotalCount(): React.JSX.Element | null {
  const {
    state: { list }
  } = useListContext()

  if (list == null) {
    return null
  }

  return <span>{list.meta.recordCount}</span>
}
