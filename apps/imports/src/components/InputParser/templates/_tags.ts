// used to keep same columns in all taggable resources
export type CsvTagsColumn =
  | 'tags.id'
  | 'tags.name'
  | '_add_tags'
  | '_remove_tags'
export const csvTagsColumns: CsvTagsColumn[] = [
  'tags.id',
  'tags.name',
  '_add_tags',
  '_remove_tags'
]
