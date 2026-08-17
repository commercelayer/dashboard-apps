import {
  Dropdown,
  DropdownItem,
  formatDate,
  formatNumber,
  Icon,
  Progress,
  type ResourceTableColumn,
  refreshResourceLists,
  removeFromResourceLists,
  Text,
  Tooltip,
  toast,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Export } from "@commercelayer/sdk"
import { useMemo } from "react"
import { StatusBadge } from "#components/Details/StatusBadge"
import { getProgressSummary } from "#data/progress"
import { showResourceNiceName } from "#data/resources"

/** Columns of the exports table. */
export function useExportsTableColumns(): Array<
  ResourceTableColumn<"exports">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Type",
        sortBy: "resource_type",
        cell: ({ resource }) => (
          <Text weight="medium">
            {showResourceNiceName(resource.resource_type)}
            {/* the Status column is hidden on mobile, so the badge rides with the name */}
            <span className="md:hidden inline-block align-middle ml-2">
              <ExportStatus job={resource} />
            </span>
          </Text>
        ),
      },
      {
        header: "Records",
        kind: "count",
        sortBy: "records_count",
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {formatNumber({
              value: resource.records_count,
              locale: user?.locale,
            })}
          </Text>
        ),
      },
      {
        header: "Status",
        kind: "status",
        sortBy: "status",
        cell: ({ resource }) => <ExportStatus job={resource} />,
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
        cell: ({ resource }) => <ExportRowActions job={resource} />,
      },
    ],
    [user?.timezone, user?.locale],
  )
}

/**
 * How far along a running export is, or what became of it.
 *
 * A bar only while it is actually running: `pending` has nothing to show yet,
 * `interrupted` reads better as "paused" than as a bar that stopped moving, and a
 * finished export is a state rather than a progress.
 */
function ExportStatus({ job }: { job: Export }): React.JSX.Element {
  const { user } = useTokenProvider()

  if (job.status === "in_progress" && job.progress != null) {
    const { completed, expected } = getProgressSummary({
      job,
      timezone: user?.timezone,
    })

    return (
      <Tooltip
        // `inline-block` so the span the tooltip is positioned against hugs the bar
        // instead of stretching the whole cell, and `relative` so it sits above the
        // row's stretched link (`after:absolute after:inset-0` on the first cell),
        // which otherwise covers the bar and swallows the hover — the reason only
        // the percentage, itself `relative`, was triggering the tooltip
        className="inline-block relative"
        // the bar alone says roughly how far along it is; the tooltip says exactly
        // that, plus when it should be done
        content={[completed, expected].filter(Boolean).join(". ")}
        label={
          <Progress
            value={job.progress}
            max={100}
            displayMode="percentage"
            // 80px through `style`, not a class: `Progress` puts its own `w-full`
            // on the element, and app code is not Tailwind-scanned — `w-20` is not
            // in app-elements' compiled CSS, so it would do nothing here
            style={{ width: 80 }}
          >
            {job.progress}%
          </Progress>
        }
      />
    )
  }

  return <StatusBadge job={job} />
}

/**
 * The row's `…` menu. A component rather than inline JSX in the cell: it needs
 * hooks, and a `cell` callback is not a component.
 *
 * Each action is offered only when it can do something: nothing to download before
 * the file exists, nothing to resume unless it was paused, nothing to pause once it
 * has finished.
 */
function ExportRowActions({ job }: { job: Export }): React.JSX.Element | null {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { show: showCancelDialog, ConfirmDialog } = useConfirmDialog()

  const sourceFileUrl =
    job.attachment_url != null && (job.records_count ?? 0) > 0
      ? job.attachment_url
      : undefined

  const isRunning = job.status === "pending" || job.status === "in_progress"
  const canResume = job.status === "interrupted" && canUser("update", "exports")
  const canPause = isRunning && canUser("update", "exports")
  const canCancel =
    (isRunning || job.status === "interrupted") && canUser("destroy", "exports")

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

  if (canResume) {
    dropdownItems.push(
      <DropdownItem
        key="resume"
        icon="play"
        label="Resume"
        onClick={() => {
          void (async () => {
            try {
              await sdkClient.exports.update({ id: job.id, _start: true })
              refreshResourceLists("exports")
            } catch {
              toast("Could not resume export", { type: "error" })
            }
          })()
        }}
      />,
    )
  }

  if (canPause) {
    dropdownItems.push(
      <DropdownItem
        key="pause"
        icon="pause"
        label="Pause"
        onClick={() => {
          void (async () => {
            try {
              await sdkClient.exports.update({ id: job.id, _interrupt: true })
              refreshResourceLists("exports")
            } catch {
              toast("Could not pause export", { type: "error" })
            }
          })()
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
          icon="xCircle"
          title="Cancel export"
          description="This action cannot be undone."
          confirm={{
            // not just "Cancel": the dialog's own dismiss button says that
            label: "Cancel export",
            variant: "danger",
            onClick: async () => {
              // a running export has to be stopped before it can be deleted
              await sdkClient.exports.update({ id: job.id, _interrupt: true })
              await sdkClient.exports.delete(job.id)
              // there is nowhere to navigate to, so the row is dropped from the
              // table it was cancelled from
              removeFromResourceLists("exports", job.id)
            },
          }}
          cancelLabel="Close"
        />
      )}

      <Dropdown
        dropdownLabel={<Icon name="dotsThree" size="24" />}
        dropdownItems={dropdownItems}
      />
    </>
  )
}
