import {
  Badge,
  ListDetails,
  ListDetailsItem,
  Tag,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"
import { FiltersPreview } from "./FiltersPreview"
import { useExportDetailsContext } from "./Provider"

export const ExportDetails = withSkeletonTemplate(({ isLoading }) => {
  const {
    state: { data },
  } = useExportDetailsContext()

  if (data == null) {
    return null
  }

  return (
    <ListDetails title="Info" isLoading={isLoading}>
      <ListDetailsItem label="Includes" gutter="none">
        {data.includes != null && data.includes.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {data.includes.map((inc) => (
              <Tag key={inc}>{inc}</Tag>
            ))}
          </div>
        ) : null}
      </ListDetailsItem>

      <ListDetailsItem label="Filters" gutter="none">
        <FiltersPreview filters={data.filters} />
      </ListDetailsItem>

      <ListDetailsItem label="Options" gutter="none">
        {data.dry_data === true || !isEmpty(data.fields) ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {data.dry_data === true && (
              <Badge variant="teal" icon="check">
                Importable
              </Badge>
            )}
            {!isEmpty(data.fields) && (
              <Badge variant="teal" icon="check">
                Simple format
              </Badge>
            )}
          </div>
        ) : null}
      </ListDetailsItem>
    </ListDetails>
  )
})
