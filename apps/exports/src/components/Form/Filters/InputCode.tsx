import { ErrorBoundary, InputJson } from '@commercelayer/app-elements'
import { useState } from 'react'

type ExportJsonFilters = object

interface Props {
  onDataReady: (json: ExportJsonFilters) => void
  onDataResetRequest: () => void
}

export function InputCode({
  onDataReady,
  onDataResetRequest
}: Props): JSX.Element {
  const [renderKey, setRenderKey] = useState<number | undefined>(undefined)

  return (
    <ErrorBoundary
      errorDescription='We could not parse your input. Please try again.'
      onRetry={() => {
        setRenderKey(new Date().getTime())
      }}
      key={renderKey}
    >
      <InputJson<ExportJsonFilters>
        placeholder={placeholder}
        onDataReady={onDataReady}
        onDataResetRequest={onDataResetRequest}
        validateFn={(maybeJson) => maybeJson}
      />
    </ErrorBoundary>
  )
}

const placeholder = {
  status_in: ['placed', 'approved'],
  placed_at_gteq: '2018-01-01T12:00:00.000Z',
  country_code_eq: 'IT'
}
