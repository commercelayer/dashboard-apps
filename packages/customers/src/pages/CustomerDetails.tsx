import {
  Button,
  Dropdown,
  DropdownItem,
  EmptyState,
  Icon,
  PageLayout,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  goBack,
  useEditMetadataOverlay,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { CustomerAddresses } from '#components/CustomerAddresses'
import { CustomerInfo } from '#components/CustomerInfo'
import { CustomerLastOrders } from '#components/CustomerLastOrders'
import { CustomerStatus } from '#components/CustomerStatus'
import { CustomerTimeline } from '#components/CustomerTimeline'
import { CustomerWallet } from '#components/CustomerWallet'
import { ScrollToTop } from '#components/ScrollToTop'
import { appRoutes } from '#data/routes'
import { useCustomerDetails } from '#hooks/useCustomerDetails'
import { isMockedId } from '#mocks'

export function CustomerDetails(): JSX.Element {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ customerId: string }>(appRoutes.details.path)

  const customerId = params?.customerId ?? ''

  const { customer, isLoading, error } = useCustomerDetails(customerId)

  const { Overlay: EditMetadataOverlay, show: showEditMetadataOverlay } =
    useEditMetadataOverlay()

  if (error != null) {
    return (
      <PageLayout
        title='Customers'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(appRoutes.list.makePath())
          }
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const pageTitle = `${customer.email}`

  return (
    <PageLayout
      mode={mode}
      actionButton={
        canUser('update', 'customers') && (
          <div className='flex items-center gap-2'>
            <Link href={appRoutes.edit.makePath(customerId)} asChild>
              <Button variant='primary' size='small'>
                Edit
              </Button>
            </Link>
            <Dropdown
              dropdownLabel={
                <Button variant='secondary' size='small'>
                  <Icon name='dotsThree' size={16} weight='bold' />
                </Button>
              }
              dropdownItems={
                <DropdownItem
                  label='Set metadata'
                  onClick={() => {
                    showEditMetadataOverlay()
                  }}
                />
              }
            />
          </div>
        )
      }
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      navigationButton={{
        label: 'Back',
        icon: 'arrowLeft',
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.list.makePath()
          })
        }
      }}
      gap='only-top'
    >
      <ScrollToTop />
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          {!isMockedId(customer.id) && (
            <Spacer top='6'>
              <ResourceTags
                resourceType='customers'
                resourceId={customer.id}
                overlay={{ title: 'Edit tags', description: pageTitle }}
                onTagClick={(tagId) => {
                  setLocation(appRoutes.list.makePath(`tags_id_in=${tagId}`))
                }}
              />
            </Spacer>
          )}
          <Spacer top='14'>
            <CustomerStatus customer={customer} />
          </Spacer>
          <Spacer top='14'>
            <CustomerInfo customer={customer} />
          </Spacer>
          <Spacer top='14'>
            <CustomerLastOrders />
          </Spacer>
          <Spacer top='14'>
            <CustomerWallet customer={customer} />
          </Spacer>
          <Spacer top='14'>
            <CustomerAddresses customer={customer} />
          </Spacer>
          {!isMockedId(customer.id) && (
            <Spacer top='14'>
              <ResourceMetadata
                resourceType='customers'
                resourceId={customer.id}
                overlay={{
                  title: customer.email
                }}
              />
            </Spacer>
          )}
          <Spacer top='14'>
            <CustomerTimeline customer={customer} />
          </Spacer>
          {!isMockedId(customer.id) && (
            <EditMetadataOverlay
              resourceType={customer.type}
              resourceId={customer.id}
              title={customer.email}
            />
          )}
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}
