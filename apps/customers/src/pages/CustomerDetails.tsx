import {
  Button,
  EmptyState,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  formatDateWithPredicate,
  useAppLinking,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { CustomerAddresses } from '#components/CustomerAddresses'
import { CustomerInfo } from '#components/CustomerInfo'
import { CustomerLastOrders } from '#components/CustomerLastOrders'
import { CustomerTimeline } from '#components/CustomerTimeline'
import { CustomerWallet } from '#components/CustomerWallet'
import { appRoutes } from '#data/routes'
import { useCustomerDeleteOverlay } from '#hooks/useCustomerDeleteOverlay'
import { useCustomerDetails } from '#hooks/useCustomerDetails'
import { isMockedId } from '#mocks'

export function CustomerDetails(): JSX.Element {
  const {
    settings: { mode },
    user,
    canUser
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ customerId: string }>(appRoutes.details.path)
  const { goBack } = useAppLinking()

  const customerId = params?.customerId ?? ''

  const { customer, isLoading, error, mutateCustomer } =
    useCustomerDetails(customerId)

  const { DeleteOverlay, show } = useCustomerDeleteOverlay(customerId)

  const pageTitle = `${customer.email}`

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'customers')) {
    pageToolbar.buttons?.push({
      label: 'Edit',
      size: 'small',
      variant: 'secondary',
      onClick: () => {
        setLocation(appRoutes.edit.makePath(customerId))
      }
    })
  }

  if (canUser('destroy', 'customers')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Delete',
        onClick: () => {
          show()
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
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div>
            {formatDateWithPredicate({
              predicate: 'Created',
              isoDate: customer.created_at ?? '',
              timezone: user?.timezone
            })}
          </div>
        </SkeletonTemplate>
      }
      navigationButton={{
        label: 'Back',
        icon: 'arrowLeft',
        onClick: () => {
          goBack({
            currentResourceId: customerId,
            defaultRelativePath: appRoutes.list.makePath()
          })
        }
      }}
      gap='only-top'
      scrollToTop
    >
      {error != null ? (
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      ) : (
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer bottom='4'>
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
            <Spacer top='14'>
              <ResourceDetails
                resource={customer}
                onUpdated={async () => {
                  void mutateCustomer()
                }}
              />
            </Spacer>
            {!isMockedId(customer.id) && (
              <>
                <Spacer top='14'>
                  <ResourceTags
                    resourceType='customers'
                    resourceId={customer.id}
                    overlay={{ title: pageTitle }}
                    onTagClick={(tagId) => {
                      setLocation(
                        appRoutes.list.makePath(`tags_id_in=${tagId}`)
                      )
                    }}
                  />
                </Spacer>
                <Spacer top='14'>
                  <ResourceMetadata
                    resourceType='customers'
                    resourceId={customer.id}
                    overlay={{
                      title: pageTitle
                    }}
                  />
                </Spacer>
              </>
            )}
            <Spacer top='14'>
              <CustomerTimeline customer={customer} />
            </Spacer>
          </Spacer>
        </SkeletonTemplate>
      )}
      {canUser('destroy', 'customers') && <DeleteOverlay />}
    </PageLayout>
  )
}
