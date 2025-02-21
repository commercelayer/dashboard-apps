import {
  Badge,
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  formatDate,
  formatDateRange,
  Icon,
  PageLayout,
  Td,
  Text,
  Tooltip,
  Tr,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  type BadgeProps
} from '@commercelayer/app-elements'
import type { Link, ListResponse } from '@commercelayer/sdk'
import { useState } from 'react'
import type { KeyedMutator } from 'swr'

interface Props {
  link: Link
  onLinkDetailsClick: () => void
  onLinkEditClick: () => void
  mutateList: KeyedMutator<ListResponse<Link>>
}

export const LinkListRow = ({
  link,
  onLinkDetailsClick,
  onLinkEditClick,
  mutateList
}: Props): React.JSX.Element => {
  const { user, canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { Overlay, open, close } = useOverlay()
  const [isDeleteting, setIsDeleting] = useState(false)

  if (link == null) {
    return <></>
  }

  const linkName = `${link.name.substring(0, 30)}${link.name.length > 30 ? `...` : ''}`
  const linkStatus = getLinkStatus(link)

  return (
    <Tr>
      <Td>
        <Button variant='link' onClick={onLinkDetailsClick}>
          {linkName}
        </Button>
      </Td>
      <Td>
        <Tooltip
          label={
            <Text size='small' weight='regular'>
              {formatDateRange({
                rangeFrom: link?.starts_at ?? '',
                rangeTo: link?.expires_at ?? '',
                timezone: user?.timezone
              })}
            </Text>
          }
          content={
            <>
              <Text tag='div' size='small'>
                From:{' '}
                {formatDate({
                  isoDate: link.starts_at ?? undefined,
                  timezone: user?.timezone,
                  format: 'full',
                  showCurrentYear: true
                })}
              </Text>
              <Text tag='div' size='small'>
                To:{' '}
                {formatDate({
                  isoDate: link?.expires_at ?? undefined,
                  timezone: user?.timezone,
                  format: 'full',
                  showCurrentYear: true
                })}
              </Text>
            </>
          }
        />
      </Td>
      <Td>
        <Badge variant={getBadgeVariant(link)}>{getLinkStatus(link)}</Badge>
      </Td>
      <Td align='right'>
        <Dropdown
          dropdownItems={
            <>
              <DropdownItem label='Show QR' onClick={onLinkDetailsClick} />
              <DropdownDivider />
              {canUser('update', 'links') && (
                <>
                  <DropdownItem label='Edit' onClick={onLinkEditClick} />
                  <DropdownItem
                    label={linkStatus === 'disabled' ? 'Enable' : 'Disable'}
                    onClick={() => {
                      void sdkClient.links
                        .update({
                          id: link.id,
                          _enable: linkStatus === 'disabled',
                          _disable: linkStatus !== 'disabled'
                        })
                        .then(() => {
                          void mutateList()
                        })
                    }}
                  />
                </>
              )}
              {canUser('destroy', 'links') && (
                <DropdownItem
                  label='Delete'
                  onClick={() => {
                    open()
                  }}
                />
              )}
            </>
          }
          dropdownLabel={
            <Button variant='circle'>
              <Icon name='dotsThree' size={24} />
            </Button>
          }
        />
      </Td>
      {canUser('destroy', 'links') && (
        <Overlay>
          <PageLayout
            title={`Confirm that you want to delete ${link.name}.`}
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
                void sdkClient.links.delete(link.id).then(() => {
                  void mutateList().then(() => {
                    close()
                  })
                })
              }}
            >
              Delete link
            </Button>
          </PageLayout>
        </Overlay>
      )}
    </Tr>
  )
}

function getBadgeVariant(link: Link): BadgeProps['variant'] {
  const status = getLinkStatus(link)
  switch (status) {
    case 'pending':
      return 'warning'

    case 'active':
      return 'success'

    case 'expired':
    default:
      return 'secondary'
  }
}

function getLinkStatus(link: Link): Link['status'] {
  if (link.disabled_at != null) {
    return 'disabled'
  } else {
    return link.status
  }
}
