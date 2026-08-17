import {
  Dropdown,
  DropdownItem,
  formatDate,
  Icon,
  isMock,
  isMockedId,
  type ResourceTableColumn,
  removeFromResourceLists,
  Text,
  useConfirmDialog,
  useCoreSdkProvider,
  useEditMetadataOverlay,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Tag } from "@commercelayer/sdk"
import { useMemo } from "react"
import { useLocation } from "wouter"
import { appRoutes } from "#data/routes"

/**
 * Columns of the tags table.
 *
 * A tag has no detail page: everything you can do with one lives in the row's
 * `…` menu.
 */
export function useTagsTableColumns(): Array<ResourceTableColumn<"tags">> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Name",
        sortBy: "name",
        cell: ({ resource }) => <Text weight="medium">{resource.name}</Text>,
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
        cell: ({ resource }) => <TagRowActions tag={resource} />,
      },
    ],
    [user?.timezone, user?.locale],
  )
}

/**
 * The row's `…` menu. A component rather than inline JSX in the cell: it needs
 * hooks, and a `cell` callback is not a component.
 */
function TagRowActions({ tag }: { tag: Tag }): React.JSX.Element {
  const [, setLocation] = useLocation()
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()

  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()
  const { Overlay: EditMetadataOverlay, show: showEditMetadataOverlay } =
    useEditMetadataOverlay()

  const dropdownItems: React.JSX.Element[] = []

  if (canUser("update", "tags") && !isMock(tag)) {
    dropdownItems.push(
      <DropdownItem
        key="edit"
        icon="pencilSimple"
        label="Edit"
        onClick={() => {
          setLocation(appRoutes.edit.makePath(tag.id))
        }}
      />,
    )
  }

  if (canUser("update", "tags")) {
    dropdownItems.push(
      <DropdownItem
        key="metadata"
        icon="code"
        label="Metadata"
        onClick={() => {
          showEditMetadataOverlay()
        }}
      />,
    )
  }

  if (canUser("destroy", "tags")) {
    dropdownItems.push(
      <DropdownItem
        key="delete"
        icon="trash"
        label="Delete"
        onClick={() => {
          showDeleteDialog()
        }}
      />,
    )
  }

  return (
    <>
      {!isMockedId(tag.id) && (
        <EditMetadataOverlay
          resourceType={tag.type}
          resourceId={tag.id}
          title={tag.name}
        />
      )}

      {canUser("destroy", "tags") && (
        // the dialog reports a failed delete itself, as an error toast
        <ConfirmDialog
          icon="trash"
          title={`Delete tag ${tag.name}`}
          description="This action cannot be undone."
          confirm={{
            label: "Delete tag",
            variant: "danger",
            onClick: async () => {
              await sdkClient.tags.delete(tag.id)
              // there is no page to navigate away to, so the row is dropped from
              // the table it was deleted from
              removeFromResourceLists("tags", tag.id)
            },
          }}
        />
      )}

      <Dropdown
        dropdownLabel={<Icon name="dotsThree" size="24" />}
        dropdownItems={dropdownItems}
      />
    </>
  )
}
