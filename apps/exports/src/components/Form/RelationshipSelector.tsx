import { type AllowedResourceType } from 'App'
import {
  isResourceWithRelationship,
  getRelationshipsByResourceType
} from '#data/relationships'
import { HookedInputSelect } from '@commercelayer/app-elements'

interface Props {
  resourceType: AllowedResourceType
}

export function RelationshipSelector({
  resourceType
}: Props): JSX.Element | null {
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
