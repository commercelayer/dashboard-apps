import { ReturnAddresses } from '#components/ReturnAddresses'
import { ReturnInfo } from '#components/ReturnInfo'
import { ReturnSteps } from '#components/ReturnSteps'
import { ReturnSummary } from '#components/ReturnSummary'
import { ScrollToTop } from '#components/ScrollToTop'
import { Timeline } from '#components/Timeline'
import { appRoutes } from '#data/routes'
import { useReturnDetails } from '#hooks/useReturnDetails'
import { isMockedId } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

function ReturnDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const [, params] = useRoute<{ returnId: string }>(appRoutes.details.path)
  const { goBack } = useAppLinking()

  const returnId = params?.returnId ?? ''

  const { returnObj, isLoading, mutateReturn } = useReturnDetails(returnId)

  if (returnId === undefined || !canUser('read', 'returns')) {
    return (
      <PageLayout
        title={t('resources.returns.name_other')}
        navigationButton={{
          label: t('common.back'),
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(appRoutes.home.makePath())
          }
        }}
        mode={mode}
      >
        <EmptyState
          title={t('common.not_authorized')}
          description={t('common.not_authorized_description')}
          action={
            <Link href={appRoutes.home.makePath()}>
              <Button variant='primary'>{t('common.routes.go_home')}</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = `${t('resources.returns.name')} #${returnObj.number}`

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      navigationButton={{
        label: t('resources.returns.name_other'),
        icon: 'arrowLeft',
        onClick: () => {
          goBack({
            currentResourceId: returnId,
            defaultRelativePath: appRoutes.home.makePath()
          })
        }
      }}
    >
      <ScrollToTop />
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          <ReturnSteps returnObj={returnObj} />
          <Spacer top='14'>
            <ReturnInfo returnObj={returnObj} />
          </Spacer>
          <Spacer top='14'>
            <ReturnSummary returnObj={returnObj} />
          </Spacer>
          <Spacer top='14'>
            <ReturnAddresses returnObj={returnObj} />
          </Spacer>
          <Spacer top='14'>
            <ResourceDetails
              resource={returnObj}
              onUpdated={async () => {
                void mutateReturn()
              }}
            />
          </Spacer>
          {!isMockedId(returnObj.id) && (
            <>
              <Spacer top='14'>
                <ResourceTags
                  resourceType='returns'
                  resourceId={returnObj.id}
                  overlay={{
                    title: pageTitle
                  }}
                />
              </Spacer>
              <Spacer top='14'>
                <ResourceMetadata
                  resourceType='returns'
                  resourceId={returnObj.id}
                  overlay={{
                    title: pageTitle
                  }}
                />
              </Spacer>
            </>
          )}
          <Spacer top='14'>
            <Timeline returnObj={returnObj} />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default ReturnDetails
