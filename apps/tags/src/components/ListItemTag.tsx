import {
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon,
  isMock,
  isMockedId,
  ListItem,
  PageLayout,
  type ResourceListItemTemplateProps,
  Spacer,
  Text,
  toast,
  useCoreSdkProvider,
  useEditMetadataOverlay,
  useOverlay,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import { useState } from "react"
import { useLocation } from "wouter"
import { appRoutes } from "#data/routes"
import { makeTag } from "#mocks"

export const ListItemTag = withSkeletonTemplate<
  ResourceListItemTemplateProps<"tags">
>(({ resource = makeTag(), remove }) => {
  const [, setLocation] = useLocation()
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()

  const [isDeleting, setIsDeleting] = useState(false)
  const {
    Overlay: DeleteTagOverlay,
    open: showDeleteTagOverlay,
    close: hideDeleteTagOverlay,
  } = useOverlay()

  const { Overlay: EditMetadataOverlay, show: showEditMetadataOverlay } =
    useEditMetadataOverlay()

  const dropdownItems: React.JSX.Element[] = []

  if (canUser("update", "tags") && !isMock(resource)) {
    dropdownItems.push(
      <DropdownItem
        label="Edit"
        onClick={() => {
          setLocation(appRoutes.edit.makePath(resource.id))
        }}
      />,
    )
  }

  if (canUser("update", "tags")) {
    dropdownItems.push(
      <DropdownItem
        label="Set metadata"
        onClick={() => {
          showEditMetadataOverlay()
        }}
      />,
    )
  }

  if (canUser("destroy", "tags")) {
    if (dropdownItems.length > 0) {
      dropdownItems.push(<DropdownDivider />)
    }

    dropdownItems.push(
      <DropdownItem
        label="Delete"
        onClick={() => {
          setIsDeleting(false)
          showDeleteTagOverlay()
        }}
      />,
    )
  }

  const contextMenu = (
    <Dropdown
      dropdownLabel={<Icon name="dotsThree" size="24" />}
      dropdownItems={dropdownItems}
    />
  )

  return (
    <>
      <ListItem padding="none">
        <Spacer top="4" bottom="4">
          <Text tag="span" weight="semibold">
            {resource.name}
          </Text>
        </Spacer>
        {!isMockedId(resource.id) && (
          <EditMetadataOverlay
            resourceType={resource.type}
            resourceId={resource.id}
            title={resource.name}
          />
        )}
        {contextMenu}
      </ListItem>
      {canUser("destroy", "tags") && (
        <DeleteTagOverlay>
          <PageLayout
            title={`Confirm that you want to delete the ${resource.name} tag.`}
            description="This action cannot be undone, proceed with caution."
            minHeight={false}
            navigationButton={{
              label: "Cancel",
              icon: "x",
              onClick: () => {
                if (!isDeleting) {
                  hideDeleteTagOverlay()
                }
              },
            }}
          >
            <Button
              variant="danger"
              size="small"
              disabled={isDeleting}
              onClick={(e) => {
                setIsDeleting(true)
                e.stopPropagation()
                let wasDeleted = false
                void sdkClient.tags
                  .delete(resource.id)
                  .then(() => {
                    wasDeleted = true
                  })
                  .catch((error) => {
                    const title: string | undefined = error?.errors?.[0]?.title
                    toast(title ?? "An error occurred", { type: "error" })
                  })
                  .finally(() => {
                    setIsDeleting(false)
                    hideDeleteTagOverlay()
                    if (wasDeleted) remove?.()
                  })
              }}
            >
              Delete tag
            </Button>
          </PageLayout>
        </DeleteTagOverlay>
      )}
    </>
  )
})
