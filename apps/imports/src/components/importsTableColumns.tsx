import {
  Dropdown,
  DropdownItem,
  downloadJsonAsFile,
  formatDate,
  formatNumber,
  formatResourceName,
  Icon,
  type ResourceTableColumn,
  removeFromResourceLists,
  Text,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Import, ListableResourceType } from "@commercelayer/sdk"
import { useMemo } from "react"
import { StatusBadge } from "#components/Details/StatusBadge"

/** Columns of the imports table. */
export function useImportsTableColumns(): Array<
  ResourceTableColumn<"imports">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Type",
        kind: "text",
        sortBy: "resource_type",
        cell: ({ resource }) => (
          <Text weight="medium">
            {formatResourceName({
              resource: resource.resource_type as ListableResourceType,
              count: "plural",
              format: "title",
            })}
            {/* the Status column is hidden on mobile, so the badge rides with the name */}
            <span className="md:hidden inline-block align-middle ml-2">
              <StatusBadge job={resource} />
            </span>
          </Text>
        ),
      },
      {
        header: "Records",
        kind: "count",
        sortBy: "inputs_size",
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {formatNumber({
              value: resource.inputs_size,
              locale: user?.locale,
            })}
          </Text>
        ),
      },
      {
        header: "Errors",
        kind: "count",
        sortBy: "errors_count",
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {formatNumber({
              value: resource.errors_count,
              locale: user?.locale,
            })}
          </Text>
        ),
      },
      {
        // penultimate among the columns that carry data: the last one is the
        // row's `…` menu
        header: "Status",
        kind: "status",
        sortBy: "status",
        cell: ({ resource }) => <StatusBadge job={resource} />,
      },
      {
        header: "Created",
        kind: "datetime",
        sortBy: "created_at",
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {formatDate({
              format: "full",
              isoDate: resource.created_at,
              timezone: user?.timezone,
              locale: user?.locale,
            })}
          </Text>
        ),
      },
      {
        header: "",
        kind: "actions",
        cell: ({ resource }) => <ImportRowActions job={resource} />,
      },
    ],
    [user?.timezone, user?.locale],
  )
}

/**
 * The row's `…` menu. A component rather than inline JSX in the cell: it needs
 * hooks, and a `cell` callback is not a component.
 *
 * Each action is offered only when it can do something: there is nothing to
 * download until a record has been imported, no log without errors, and an import
 * can only be cancelled while it is still pending or was interrupted.
 */
function ImportRowActions({ job }: { job: Import }): React.JSX.Element | null {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { show: showCancelDialog, ConfirmDialog } = useConfirmDialog()

  const sourceFileUrl =
    job.attachment_url != null && (job.processed_count ?? 0) > 0
      ? job.attachment_url
      : undefined

  const errorsLog =
    job.errors_log != null && Object.keys(job.errors_log).length > 0
      ? job.errors_log
      : undefined

  const canCancel =
    (job.status === "pending" || job.status === "interrupted") &&
    canUser("destroy", "imports")

  const dropdownItems: React.JSX.Element[] = []

  if (sourceFileUrl != null) {
    dropdownItems.push(
      <DropdownItem
        key="download"
        icon="download"
        label="Download"
        onClick={() => {
          window.open(sourceFileUrl, "_blank", "noopener,noreferrer")
        }}
      />,
    )
  }

  if (errorsLog != null) {
    dropdownItems.push(
      <DropdownItem
        key="log"
        icon="fileArrowDown"
        label="View log"
        onClick={() => {
          downloadJsonAsFile({
            json: errorsLog,
            filename: `${job.resource_type}_errors_log.json`,
          })
        }}
      />,
    )
  }

  if (canCancel) {
    dropdownItems.push(
      <DropdownItem
        key="cancel"
        icon="xCircle"
        label="Cancel"
        onClick={() => {
          showCancelDialog()
        }}
      />,
    )
  }

  if (dropdownItems.length === 0) {
    return null
  }

  return (
    <>
      {canCancel && (
        <ConfirmDialog
          icon="x"
          title="Cancel import"
          description="This action cannot be undone."
          confirm={{
            // not just "Cancel": the dialog's own dismiss button says that
            label: "Cancel import",
            variant: "danger",
            onClick: async () => {
              await sdkClient.imports.delete(job.id)
              // there is nowhere to navigate to, so the row is dropped from the
              // table it was cancelled from
              removeFromResourceLists("imports", job.id)
            },
          }}
          cancelLabel="Close"
        />
      )}

      <Dropdown
        dropdownLabel={<Icon name="dotsThree" size="16" />}
        dropdownItems={dropdownItems}
      />
    </>
  )
}
