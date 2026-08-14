import {
  Card,
  ListDetails,
  Text,
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

  const showIncludes = data.includes != null && data.includes.length > 0
  const showOptions = data.dry_data === true || !isEmpty(data.fields)

  return (
    <ListDetails title="Info" isLoading={isLoading}>
      <Card
        gap="6"
        overflow="visible"
        backgroundColor="light"
        className="flex flex-col gap-2 mt-6 print:p-4 print:rounded-sm"
      >
        <FiltersPreview filters={data.filters} />
        {showIncludes && (
          <div className="flex gap-2 px-1">
            <Text
              size="small"
              variant="info"
              wrap="nowrap"
              className="font-mono"
            >
              Includes:
            </Text>
            <Text size="small" className="font-mono">
              <div className="flex flex-wrap" style={{ columnGap: "0.5rem" }}>
                {data.includes?.map((inc, idx) => (
                  <span key={inc} style={{ overflowWrap: "normal" }}>
                    {inc}
                    {idx < (data.includes ?? []).length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </Text>
          </div>
        )}
        {showOptions && (
          <div className="flex gap-2 px-1">
            <Text
              size="small"
              variant="info"
              wrap="nowrap"
              className="font-mono"
            >
              Options:
            </Text>
            <Text size="small" className="font-mono">
              {data.dry_data === true && <span>importable</span>}
              {data.dry_data === true && !isEmpty(data.fields) && (
                <span className="mr-2">,</span>
              )}
              {!isEmpty(data.fields) && <span>simple format</span>}
            </Text>
          </div>
        )}
      </Card>
    </ListDetails>
  )
})
