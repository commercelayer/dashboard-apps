import { Badge, Table, Td, Th, Tr } from '@commercelayer/app-elements'
import { useImportDetailsContext } from './Provider'

// Define the structure of errors_log
type ErrorsLog = Record<string, Record<string, string[]>>

export function ImportErrors(): JSX.Element | null {
  const {
    state: { data }
  } = useImportDetailsContext()

  // Type assertion for errors_log
  const errorsLog = data?.errors_log as ErrorsLog | null

  if (errorsLog === null || errorsLog === undefined) {
    return null
  }

  return (
    <>
      <header className='border-b pb-4 flex justify-between items-center border-gray-100'>
        <h2 className='text-lg font-semibold'>Errors</h2>
      </header>
      <Table
        thead={
          <Tr>
            <Th>Code</Th>
            <Th>Error</Th>
          </Tr>
        }
        tbody={
          <>
            {Object.entries(errorsLog).map(([entityKey, fields]) => (
              <Tr key={entityKey}>
                <Td>{entityKey}</Td>
                <Td>
                  <ul>
                    {Object.entries(fields).map(([fieldName, errors]) => (
                      <li key={fieldName}>
                        The field <Badge variant='secondary'>{fieldName}</Badge>{' '}
                        {errors.length > 1
                          ? 'generated the following errors'
                          : 'generated the following error'}
                        {': '}
                        <Badge variant='secondary'>{errors.join(',')}</Badge>
                      </li>
                    ))}
                  </ul>
                </Td>
              </Tr>
            ))}
          </>
        }
      />
    </>
  )
}
