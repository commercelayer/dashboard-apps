import { FormRestock } from '#components/FormRestock'
import { ScrollToTop } from '#components/ScrollToTop'
import { appRoutes } from '#data/routes'
import { useRestockReturnLineItems } from '#hooks/useRestockReturnLineItems'
import { useRestockableList } from '#hooks/useRestockableList'
import { useReturnDetails } from '#hooks/useReturnDetails'
import { isMock } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

export function RestockReturn(): JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ returnId: string }>(appRoutes.restock.path)

  const returnId = params?.returnId
  const goBackUrl =
    returnId != null
      ? appRoutes.details.makePath(returnId)
      : appRoutes.home.makePath()

  const { returnObj, isLoading, mutateReturn } = useReturnDetails(
    returnId ?? ''
  )

  const restockableReturnLineItems = useRestockableList(returnObj)

  const {
    restockReturnLineItemsError,
    restockReturnLineItems,
    isRestockingReturnLineItems
  } = useRestockReturnLineItems()

  if (
    returnObj == null ||
    isMock(returnObj) ||
    returnObj.status !== 'received' ||
    restockableReturnLineItems?.length === 0 ||
    !canUser('update', 'return_line_items')
  ) {
    return (
      <PageLayout
        title='Restock'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title='Permission Denied'
          description='You cannot restock this return or you are not authorized to access this page.'
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
      title={<SkeletonTemplate isLoading={isLoading}>Restock</SkeletonTemplate>}
      navigationButton={{
        label: 'Back',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(goBackUrl)
        }
      }}
      overlay
    >
      <ScrollToTop />
      {restockableReturnLineItems != null &&
        restockableReturnLineItems.length !== 0 && (
          <>
            <Spacer bottom='4'>
              <FormRestock
                defaultValues={{
                  items: restockableReturnLineItems?.map((item) => ({
                    quantity: item.quantity,
                    value: item.id
                  }))
                }}
                returnLineItems={restockableReturnLineItems}
                apiError={restockReturnLineItemsError}
                onSubmit={(formValues) => {
                  void restockReturnLineItems(returnObj, formValues).then(
                    () => {
                      void mutateReturn().finally(() => {
                        setLocation(goBackUrl)
                      })
                    }
                  )
                }}
              />
            </Spacer>
            <Button
              type='submit'
              form='return-restock-form'
              fullWidth
              disabled={isRestockingReturnLineItems}
            >
              Restock
            </Button>
          </>
        )}
    </PageLayout>
  )
}
