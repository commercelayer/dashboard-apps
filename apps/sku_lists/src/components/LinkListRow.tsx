import { appRoutes } from '#data/routes'
import {
  Badge,
  Button,
  CopyToClipboard,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  formatDateRange,
  Icon,
  Td,
  Text,
  Tr,
  useCoreSdkProvider,
  useTokenProvider,
  type BadgeProps
} from '@commercelayer/app-elements'
import type { Link, ListResponse, SkuList } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'
import { useLocation } from 'wouter'

interface Props {
  link: Link
  skuListId: SkuList['id']
  mutateList: KeyedMutator<ListResponse<Link>>
}

export const LinkListRow = ({
  link,
  skuListId,
  mutateList
}: Props): JSX.Element => {
  const { user, canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  if (link == null) {
    return <></>
  }

  return (
    <Tr>
      <Td>
        <Text weight='semibold' size='regular' tag='div'>
          {link.name}
        </Text>
        <div
          style={{
            width: '154px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <span
            className='text-gray-500 font-semibold'
            style={{ fontSize: '11px' }}
          >
            {link.url}
          </span>
          <span
            style={{
              position: 'absolute',
              right: '0',
              top: '0',
              width: '26px',
              height: '100%',
              background: 'linear-gradient(to right, transparent 12px, white)'
            }}
          />
        </div>
      </Td>
      <Td>
        <CopyToClipboard showValue={false} value={link?.url ?? ''} />
      </Td>
      <Td>
        {formatDateRange({
          rangeFrom: link?.starts_at,
          rangeTo: link?.expires_at,
          timezone: user?.timezone
        })}
      </Td>
      <Td>
        <Badge variant={getBadgeVariant(link)}>{link.status}</Badge>
      </Td>
      <Td align='right'>
        <Dropdown
          dropdownItems={
            <>
              <DropdownItem
                label='Show QR'
                onClick={() => {
                  setLocation(
                    appRoutes.linksDetails.makePath({
                      skuListId,
                      linkId: link.id
                    })
                  )
                }}
              />
              <DropdownDivider />
              {canUser('update', 'links') && (
                <>
                  <DropdownItem
                    label='Edit'
                    onClick={() => {
                      setLocation(
                        appRoutes.linksEdit.makePath({
                          skuListId,
                          linkId: link.id
                        })
                      )
                    }}
                  />
                  {link.status === 'disabled' ? (
                    <DropdownItem
                      label='Enable'
                      onClick={() => {
                        void sdkClient.links
                          .update({
                            id: link.id,
                            _enable: true
                          })
                          .then(() => {
                            void mutateList()
                          })
                      }}
                    />
                  ) : (
                    <DropdownItem
                      label='Disable'
                      onClick={() => {
                        void sdkClient.links
                          .update({
                            id: link.id,
                            _disable: true
                          })
                          .then(() => {
                            void mutateList()
                          })
                      }}
                    />
                  )}
                </>
              )}
              {/* TODO: Add removal modal */}
              {/* {canUser('destroy', 'links') && <DropdownItem label='Delete' />} */}
            </>
          }
          dropdownLabel={
            <Button variant='circle'>
              <Icon name='dotsThree' size={24} />
            </Button>
          }
        />
      </Td>
    </Tr>
  )
}

function getBadgeVariant(link: Link): BadgeProps['variant'] {
  switch (link.status) {
    case 'expired':
      return 'danger'

    case 'pending':
      return 'warning'

    case 'active':
      return 'success'

    default:
      return 'secondary'
  }
}
