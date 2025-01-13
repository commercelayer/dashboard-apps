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
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

function RestockReturn(): JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
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
        title={t('apps.returns.actions.restock')}
        navigationButton={{
          label: t('common.back'),
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title={t('common.not_authorized')}
          description={t('common.routes.invalid_resource_or_not_authorized', {
            resource: t('resources.returns.name').toLowerCase()
          })}
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>{t('common.go_back')}</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {t('apps.returns.actions.restock')}
        </SkeletonTemplate>
      }
      navigationButton={{
        label: t('common.back'),
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
              {t('apps.returns.actions.restock')}
            </Button>
          </>
        )}
    </PageLayout>
  )
}

export default RestockReturn
