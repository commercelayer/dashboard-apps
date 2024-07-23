import { appRoutes } from '#data/routes'
import { isMock, isMockedId, makeTag } from '#mocks'
import {
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Icon,
  ListItem,
  PageLayout,
  Text,
  useCoreSdkProvider,
  useEditMetadataOverlay,
  useOverlay,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { ResourceListItemTemplateProps } from '@commercelayer/app-elements/dist/ui/resources/ResourceList/ResourceList'

import { useState } from 'react'
import { useLocation } from 'wouter'

export const ListItemTag = withSkeletonTemplate<
  ResourceListItemTemplateProps<'tags'>
>(({ resource = makeTag(), remove }) => {
  const [, setLocation] = useLocation()
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const { Overlay: EditMetadataOverlay, show: showEditMetadataOverlay } =
    useEditMetadataOverlay()

  const [isDeleteting, setIsDeleting] = useState(false)

  const dropdownItems: JSX.Element[] = []

  if (canUser('update', 'tags') && !isMock(resource)) {
    dropdownItems.push(
      <DropdownItem
        label='Edit'
        onClick={() => {
          setLocation(appRoutes.edit.makePath(resource.id))
        }}
      />
    )
  }

  if (canUser('update', 'tags')) {
    dropdownItems.push(
      <DropdownItem
        label='Set metadata'
        onClick={() => {
          showEditMetadataOverlay()
        }}
      />
    )
  }

  if (canUser('destroy', 'tags')) {
    if (dropdownItems.length > 0) {
      dropdownItems.push(<DropdownDivider />)
    }

    dropdownItems.push(
      <DropdownItem
        label='Delete'
        onClick={() => {
          open()
        }}
      />
    )
  }

  const contextMenu = (
    <Dropdown
      dropdownLabel={<Icon name='dotsThree' size='24' />}
      dropdownItems={dropdownItems}
    />
  )

  return (
    <>
      <ListItem>
        <div>
          <Text tag='span' weight='semibold'>
            {resource.name}
          </Text>
        </div>
        {!isMockedId(resource.id) && (
          <EditMetadataOverlay
            resourceType={resource.type}
            resourceId={resource.id}
            title={resource.name}
          />
        )}
        {contextMenu}
      </ListItem>
      {canUser('destroy', 'tags') && (
        <Overlay>
          <PageLayout
            title={`Confirm that you want to cancel the ${resource.name} tag.`}
            description='This action cannot be undone, proceed with caution.'
            minHeight={false}
            navigationButton={{
              label: 'Cancel',
              icon: 'x',
              onClick: () => {
                close()
              }
            }}
          >
            <Button
              variant='danger'
              size='small'
              disabled={isDeleteting}
              onClick={(e) => {
                setIsDeleting(true)
                e.stopPropagation()
                void sdkClient.tags.delete(resource.id).then(() => {
                  remove?.()
                  close()
                })
              }}
            >
              Delete tag
            </Button>
          </PageLayout>
        </Overlay>
      )}
    </>
  )
})
