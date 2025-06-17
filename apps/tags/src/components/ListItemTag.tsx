import { appRoutes } from '#data/routes'
import { makeTag } from '#mocks'
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
  Spacer,
  Text,
  useCoreSdkProvider,
  useEditMetadataOverlay,
  useOverlay,
  useTokenProvider,
  withSkeletonTemplate,
  type ResourceListItemTemplateProps
} from '@commercelayer/app-elements'

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

  const [isDeleting, setIsDeleting] = useState(false)

  const dropdownItems: React.JSX.Element[] = []

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
      <ListItem padding='none'>
        <Spacer top='4' bottom='4'>
          <Text tag='span' weight='semibold'>
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
              disabled={isDeleting}
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
