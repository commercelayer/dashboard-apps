import {
  Button,
  EmptyState,
  PageLayout,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  goBack,
  useEditMetadataOverlay,
  useTokenProvider,
  type PageHeadingProps
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

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'customers')) {
    pageToolbar.buttons?.push({
      label: 'Edit',
      size: 'small',
      onClick: () => {
        setLocation(appRoutes.edit.makePath(customerId))
      }
    })
    pageToolbar.dropdownItems?.push([
      {
        label: 'Set metadata',
        onClick: () => {
          showEditMetadataOverlay()
        }
      }
    ])
  }

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar}
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
