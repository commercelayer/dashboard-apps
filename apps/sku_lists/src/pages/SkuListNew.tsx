import { SkuListForm } from '#components/SkuListForm'
import { appRoutes } from '#data/routes'
import { useCreateSkuList } from '#hooks/useCreateSkuList'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

export function SkuListNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { createSkuListError, createSkuList, isCreatingSkuList } =
    useCreateSkuList()

  const goBackUrl = appRoutes.list.makePath({})

  if (!canUser('create', 'sku_lists')) {
    return (
      <PageLayout
        title='New SKU list'
        navigationButton={{
          onClick: () => {
            setLocation(goBackUrl)
          },
          label: 'Cancel',
          icon: 'x'
        }}
        scrollToTop
      >
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
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
      title={<>New SKU list</>}
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: 'Cancel',
        icon: 'x'
      }}
      gap='only-top'
      scrollToTop
      overlay
    >
      <Spacer bottom='14'>
        <SkuListForm
          defaultValues={{ manual: true }}
          apiError={createSkuListError}
          isSubmitting={isCreatingSkuList}
          onSubmit={(formValues) => {
            void createSkuList(formValues).then((createdSkuList) => {
              if (createdSkuList != null) {
                setLocation(
                  appRoutes.details.makePath({ skuListId: createdSkuList.id })
                )
              }
            })
          }}
        />
      </Spacer>
    </PageLayout>
  )
}
