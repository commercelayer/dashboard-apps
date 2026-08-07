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

  return (
    <ListDetails title="Info" isLoading={isLoading}>
      <Card
        gap="6"
        overflow="visible"
        backgroundColor="light"
        className="flex flex-col gap-2 mt-6 print:p-4 print:rounded-sm"
      >
        <FiltersPreview filters={data.filters} />

        <div className="flex flex-wrap items-center gap-2 px-1">
          <Text size="small" variant="info" className="font-mono">
            Includes:
          </Text>
          <Text size="small" className="font-mono ">
            {data.includes != null && data.includes.length > 0 ? (
              data.includes.map((inc, idx) => (
                <span key={inc} className="mr-2">
                  {inc}
                  {idx < (data.includes ?? []).length - 1 ? "," : ""}
                </span>
              ))
            ) : (
              <Text variant="disabled">&#8212;</Text>
            )}
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-1">
          <Text size="small" variant="info" className="font-mono">
            Options:
          </Text>
          <Text size="small" className="font-mono ">
            {data.dry_data === true && <span>importable</span>}
            {data.dry_data === true && !isEmpty(data.fields) && (
              <span className="mr-2">,</span>
            )}
            {!isEmpty(data.fields) && <span>simple format</span>}
            {data.dry_data !== true && isEmpty(data.fields) && (
              <Text variant="disabled">&#8212;</Text>
            )}
          </Text>
        </div>
      </Card>
    </ListDetails>
  )
})
