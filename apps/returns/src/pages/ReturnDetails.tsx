import { ReturnAddresses } from '#components/ReturnAddresses'
import { ReturnInfo } from '#components/ReturnInfo'
import { ReturnSteps } from '#components/ReturnSteps'
import { ReturnSummary } from '#components/ReturnSummary'
import { ScrollToTop } from '#components/ScrollToTop'
import { Timeline } from '#components/Timeline'
import { appRoutes } from '#data/routes'
import { useReturnDetails } from '#hooks/useReturnDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  formatDateWithPredicate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import { Link, useLocation, useRoute } from 'wouter'

export function ReturnDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ returnId: string }>(appRoutes.details.path)

  const returnId = params?.returnId ?? ''

  const { returnObj, isLoading } = useReturnDetails(returnId)

  if (returnId === undefined || !canUser('read', 'returns')) {
    return (
      <PageLayout
        title='Returns'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(appRoutes.home.makePath())
          }
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.home.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = `Return #${returnObj.number}`

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          {returnObj.updated_at != null ? (
            <div>
              {formatDateWithPredicate({
                predicate: 'Updated',
                isoDate: returnObj.updated_at,
                timezone: user?.timezone
              })}
            </div>
          ) : returnObj.created_at != null ? (
            <div>
              {formatDateWithPredicate({
                predicate: 'Created',
                isoDate: returnObj.updated_at,
                timezone: user?.timezone
              })}
            </div>
          ) : null}
          {!isEmpty(returnObj.reference) && (
            <div>Ref. {returnObj.reference}</div>
          )}
        </SkeletonTemplate>
      }
      navigationButton={{
        label: 'Returns',
        icon: 'arrowLeft',
        onClick: () => {
          goBack({
            setLocation,
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
            <Timeline returnObj={returnObj} />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}
