import { FormReturn } from '#components/FormReturn'
import { appRoutes } from '#data/routes'
import { useCreateReturnLineItems } from '#hooks/useCreateReturnLineItems'
import { useMarketInventoryModel } from '#hooks/useMarketInventoryModel'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { useReturn } from '#hooks/useReturn'
import { useReturnableList } from '#hooks/useReturnableList'
import { isMock } from '#mocks'
import { getOrderTitle } from '#utils/getOrderTitle'
import {
  Button,
  EmptyState,
  InputSelect,
  PageLayout,
  ResourceAddress,
  Section,
  SkeletonTemplate,
  Spacer,
  Stack,
  isSingleValueSelected,
  useTokenProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { Address, StockLocation } from '@commercelayer/sdk'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

function CreateReturn(): JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.return.path)

  const orderId = params?.orderId ?? ''
  const goBackUrl =
    orderId != null
      ? appRoutes.details.makePath({ orderId })
      : appRoutes.home.makePath({})

  const { order, isLoading, mutateOrder } = useOrderDetails(orderId)
  const { inventoryModel } = useMarketInventoryModel(order.market?.id)
  const returnObj = useReturn(order)

  const returnableLineItems = useReturnableList(order)
  const {
    createReturnLineItemsError,
    createReturnLineItems,
    isCreatingReturnLineItems
  } = useCreateReturnLineItems()

  const [stockLocation, setStockLocation] = useState<StockLocation>()
  const [destinationAddress, setDestinationAddress] = useState<Address>()
  useEffect(() => {
    if (
      destinationAddress === undefined &&
      returnObj?.stock_location?.address != null
    ) {
      setStockLocation(returnObj?.stock_location)
      setDestinationAddress(returnObj?.stock_location?.address)
    }
  }, [destinationAddress, returnObj])

  const orderInventoryReturnLocations =
    inventoryModel?.inventory_return_locations ?? []

  const stockLocations = orderInventoryReturnLocations
    .filter((item) => item.stock_location != null)
    .map((item) => {
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      return item.stock_location as StockLocation
    })

  const stockLocationToSelectOption = useCallback(
    (stockLocation: StockLocation): InputSelectValue => {
      return {
        value: stockLocation.id,
        label: `${stockLocation.name}`,
        meta: stockLocation
      }
    },
    []
  )

  const stockLocationsToSelectOptions = useCallback(
    (stockLocations: StockLocation[]): InputSelectValue[] =>
      stockLocations.map((stockLocation) => {
        return {
          value: stockLocation.id,
          label: `${stockLocation.name}`,
          meta: stockLocation
        }
      }),
    []
  )

  if (
    isMock(order) ||
    returnObj == null ||
    stockLocation == null ||
    destinationAddress == null
  )
    return <></>

  if (
    order.fulfillment_status !== 'fulfilled' ||
    returnableLineItems.length === 0 ||
    !canUser('create', 'returns')
  ) {
    return (
      <PageLayout
        title='Request return'
        navigationButton={{
          onClick: () => {
            setLocation(goBackUrl)
          },
          label: orderId != null ? 'Back' : 'Orders',
          icon: 'arrowLeft'
        }}
      >
        <EmptyState
          title='Permission Denied'
          description='You cannot create a return for this order or you are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      overlay
      title={
        <SkeletonTemplate isLoading={isLoading}>
          Request return
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: orderId != null ? getOrderTitle(order) : 'Orders',
        icon: 'arrowLeft'
      }}
      scrollToTop
    >
      {stockLocations.length > 1 && (
        <Spacer bottom='12'>
          <InputSelect
            label='To'
            isClearable={false}
            initialValues={stockLocationsToSelectOptions(stockLocations)}
            defaultValue={stockLocationToSelectOption(
              // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
              returnObj.stock_location as StockLocation
            )}
            onSelect={(selectedOption) => {
              if (isSingleValueSelected(selectedOption)) {
                if (selectedOption?.meta?.address != null) {
                  setStockLocation(selectedOption?.meta as StockLocation)
                  setDestinationAddress(
                    selectedOption?.meta?.address as Address
                  )
                }
              }
            }}
          />
        </Spacer>
      )}
      {returnableLineItems != null && returnableLineItems.length !== 0 && (
        <>
          <Spacer bottom='12'>
            <FormReturn
              defaultValues={{
                items: returnableLineItems?.map((item) => ({
                  quantity: item.quantity,
                  value: item.id
                }))
              }}
              lineItems={returnableLineItems}
              apiError={createReturnLineItemsError}
              onSubmit={(formValues) => {
                void createReturnLineItems(
                  returnObj,
                  stockLocation,
                  formValues
                ).then(() => {
                  void mutateOrder().finally(() => {
                    setLocation(goBackUrl)
                  })
                })
              }}
            />
          </Spacer>
          {returnObj.origin_address != null &&
            returnObj?.stock_location?.address != null && (
              <Spacer bottom='12'>
                <Section title='Addresses' border='none'>
                  <Stack>
                    <ResourceAddress
                      title='Origin'
                      resource={returnObj.origin_address}
                      editable
                    />
                    <ResourceAddress
                      title='Destination'
                      resource={destinationAddress}
                    />
                  </Stack>
                </Section>
              </Spacer>
            )}
          <Button
            type='submit'
            form='return-creation-form'
            fullWidth
            disabled={isCreatingReturnLineItems}
          >
            Request return
          </Button>
        </>
      )}
    </PageLayout>
  )
}
export default CreateReturn
