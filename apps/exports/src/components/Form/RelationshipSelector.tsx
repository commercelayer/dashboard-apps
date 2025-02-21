import {
  getRelationshipsByResourceType,
  isResourceWithRelationship
} from '#data/relationships'
import { HookedInputSelect } from '@commercelayer/app-elements'
import { type AllowedResourceType } from 'App'

interface Props {
  resourceType: AllowedResourceType
}

export function RelationshipSelector({
  resourceType
}: Props): React.JSX.Element | null {
  if (!isResourceWithRelationship(resourceType)) {
    return null
  }

  const relationships = getRelationshipsByResourceType(resourceType)

  return (
    <HookedInputSelect
      initialValues={relationships.map((r) => ({
        value: r,
        label: r
      }))}
      name='includes'
      isClearable
      isMulti
      hint={{ text: 'List of relationships to be included in the export.' }}
      label='Include'
      pathToValue='value'
    />
  )
}
