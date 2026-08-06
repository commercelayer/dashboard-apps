import {
  Card,
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
    <Card
      gap="6"
      overflow="visible"
      backgroundColor="light"
      className="flex flex-col gap-2 print:p-4 print:rounded-sm"
    >
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap items-center gap-2 px-1">
          <Text size="small" variant="info" className="font-mono">
            {row.label}:
          </Text>
          {row.values.map((value) => (
            <Text key={value} size="small" className="font-mono">
              {value}
            </Text>
          ))}
        </div>
      ))}
    </Card>
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

    const ids = Array.isArray(value) ? value.map(String) : [String(value)]
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
      const values = Array.isArray(value) ? value.map(String) : [String(value)]

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

      if (isMetadataFilterField(field)) {
        return { label: filterFieldLabel(field), values }
      }

      const valueLabels = VALUE_LABELS[field]
      if (valueLabels != null) {
        return {
          label: filterFieldLabel(field),
          values: values.map((v) => valueLabels[v] ?? capitalize(v)),
        }
      }

      return {
        label: filterFieldLabel(field),
        values: values.map(capitalize),
      }
    })
}

function capitalize(text: string): string {
  return text
    .split(/[_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
