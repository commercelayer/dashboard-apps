import {
  formatDate,
  Text,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useEffect, useState } from "react"
import {
  fetchInitialResources,
  type SearchableResource,
} from "#components/Form/ResourceFinder/utils"
import {
  CODE_FILTER_FIELDS,
  filterFieldLabel,
  isDateFilterField,
  isMetadataFilterField,
  RESOURCE_FILTER_FIELDS,
  VALUE_LABELS,
} from "./filtersConfig"

interface Props {
  filters?: Record<string, unknown> | null
}

interface FilterRow {
  label: string
  values: string[]
}

export function FiltersPreview({ filters }: Props): React.JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()
  const [namesByResourceType, setNamesByResourceType] = useState<
    Record<string, Map<string, string>>
  >({})

  const idsByResourceType = getIdsByResourceType(filters)
  const idsByResourceTypeKey = JSON.stringify(idsByResourceType)

  useEffect(() => {
    if (sdkClient == null || Object.keys(idsByResourceType).length === 0) {
      return
    }

    void Promise.allSettled(
      Object.entries(idsByResourceType).map(async ([resourceType, ids]) => {
        const suggestions = await fetchInitialResources({
          sdkClient,
          resourceType: resourceType as SearchableResource,
          filters: { id_in: ids.join(",") },
          fieldForValue: "id",
          fieldForLabel: "name",
        })
        return [
          resourceType,
          new Map(suggestions.map((s) => [String(s.value), s.label])),
        ] as const
      }),
    ).then((results) => {
      const entries = results.flatMap((result) => {
        if (result.status === "rejected") {
          console.error(
            "Export filters preview: could not resolve resource names",
            result.reason,
          )
          return []
        }
        return [result.value]
      })
      setNamesByResourceType(Object.fromEntries(entries))
    })
  }, [sdkClient, idsByResourceTypeKey])

  if (filters == null || Object.keys(filters).length === 0) {
    return <Text variant="disabled">&#8212;</Text>
  }

  const rows = buildFilterRows(filters, namesByResourceType, user?.timezone)

  return (
    <>
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap items-center gap-2 px-1">
          <Text size="small" variant="info" className="font-mono">
            {row.label}:
          </Text>
          <Text size="small" className="font-mono">
            {row.values.map((value, idx) => (
              <span key={value} className="mr-2">
                {value}
                {idx < row.values.length - 1 ? "," : ""}
              </span>
            ))}
          </Text>
        </div>
      ))}
    </>
  )
}

function getIdsByResourceType(
  filters?: Record<string, unknown> | null,
): Record<string, string[]> {
  if (filters == null) {
    return {}
  }

  const idsByResourceType: Record<string, Set<string>> = {}

  for (const [field, resourceType] of Object.entries(RESOURCE_FILTER_FIELDS)) {
    const value = filters[field]
    if (value == null) {
      continue
    }

    const ids = splitValues(value)
    const set = idsByResourceType[resourceType] ?? new Set<string>()
    ids.forEach((id) => set.add(id))
    idsByResourceType[resourceType] = set
  }

  return Object.fromEntries(
    Object.entries(idsByResourceType).map(([resourceType, ids]) => [
      resourceType,
      Array.from(ids),
    ]),
  )
}

function buildFilterRows(
  filters: Record<string, unknown>,
  namesByResourceType: Record<string, Map<string, string>>,
  timezone?: string,
): FilterRow[] {
  return Object.entries(filters)
    .filter(([, value]) => value != null && value !== "")
    .map(([field, value]) => {
      if (isMetadataFilterField(field)) {
        return { label: filterFieldLabel(field), values: [String(value)] }
      }

      const values = splitValues(value)

      const resourceType = RESOURCE_FILTER_FIELDS[field]
      if (resourceType != null) {
        const names = namesByResourceType[resourceType]
        return {
          label: filterFieldLabel(field),
          values: values.map((id) => names?.get(id) ?? id),
        }
      }

      if (CODE_FILTER_FIELDS.has(field)) {
        return { label: filterFieldLabel(field), values }
      }

      if (isDateFilterField(field)) {
        return {
          label: filterFieldLabel(field),
          values: values.map((isoDate) =>
            formatDate({ isoDate, format: "full", timezone }),
          ),
        }
      }

      const valueLabels = VALUE_LABELS[field]
      if (valueLabels != null) {
        return {
          label: filterFieldLabel(field),
          values: values.map((v) => valueLabels[v] ?? v),
        }
      }

      return { label: filterFieldLabel(field), values }
    })
}

/** Splits a filter value into individual values, handling both arrays and comma-separated strings (Ransack `_in`-style filters). */
function splitValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String)
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  }

  return [String(value)]
}
