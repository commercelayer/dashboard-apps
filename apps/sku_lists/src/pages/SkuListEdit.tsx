import { SkuListForm } from '#components/SkuListForm'
import { appRoutes } from '#data/routes'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import { useUpdateSkuList } from '#hooks/useUpdateSkuList'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

export function SkuListEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  const [, params] = useRoute<{ skuListId: string }>(appRoutes.edit.path)
  const skuListId = params?.skuListId ?? ''

  const { skuList, isLoading, mutateSkuList } = useSkuListDetails(skuListId)

  const { updateSkuListError, updateSkuList, isUpdatingSkuList } =
    useUpdateSkuList()

  const goBackUrl = appRoutes.details.makePath({ skuListId })

  if (!canUser('update', 'sku_lists')) {
    return (
      <PageLayout
        title='Edit SKU list'
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
      title={
        <SkeletonTemplate isLoading={isLoading}>Edit SKU list</SkeletonTemplate>
      }
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
        {!isLoading && skuList != null ? (
          <SkuListForm
            resource={skuList}
            defaultValues={{
              id: skuList.id,
              name: skuList.name,
              manual: Boolean(skuList.manual),
              sku_code_regex:
                skuList.manual === false
                  ? (skuList.sku_code_regex ?? '')
                  : undefined
            }}
            apiError={updateSkuListError}
            isSubmitting={isUpdatingSkuList}
            onSubmit={(formValues) => {
              void updateSkuList(formValues).then(() => {
                void mutateSkuList()
                setLocation(goBackUrl)
              })
            }}
          />
        ) : null}
      </Spacer>
    </PageLayout>
  )
}
