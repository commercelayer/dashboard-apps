import { Table, Td, Th, Tr } from '@commercelayer/app-elements'

interface Props {
  tableRows?: JSX.Element[]
  isTableEmpty: boolean
}

export const LinkListTable = ({
  tableRows,
  isTableEmpty
}: Props): JSX.Element => {
  return (
    <Table
      variant='boxed'
      thead={
        <Tr>
          <Th>Code</Th>
          <Th> </Th>
          <Th>Active in</Th>
          <Th>Status</Th>
          <Th> </Th>
        </Tr>
      }
      tbody={
        <>
          {isTableEmpty && (
            <Tr>
              <Td colSpan={5}>no results</Td>
            </Tr>
          )}
          {tableRows}
        </>
      }
    />
  )
}
