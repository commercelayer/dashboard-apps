import { type AllowedResourceType } from 'App'
import { downloadTemplateAsCsvFile } from './templates'
import { Button, Hint } from '@commercelayer/app-elements'

interface Props {
  resourceType: AllowedResourceType
}

export function SuggestionTemplate({ resourceType }: Props): JSX.Element {
  return (
    <Hint icon='lightbulbFilament'>
      Use our{' '}
      <Button
        type='button'
        variant='link'
        onClick={() => {
          downloadTemplateAsCsvFile({
            resourceType
          })
        }}
      >
        CSV template
      </Button>{' '}
      to avoid formatting errors.
    </Hint>
  )
}
