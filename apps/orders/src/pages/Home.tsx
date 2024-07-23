import { makeInstructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  HomePageLayout,
  List,
  ListItem,
  RadialProgress,
  SkeletonTemplate,
  Spacer,
  StatusIcon,
  Text,
  useResourceFilters
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'
import { useListCounters } from '../metricsApi/useListCounters'

function Home(): JSX.Element {
  const [, setLocation] = useLocation()
  const search = useSearch()
  const { data: counters, isLoading: isLoadingCounters } = useListCounters()

  const { adapters, SearchWithNav } = useResourceFilters({
    instructions: makeInstructions({})
  })

  return (
    <HomePageLayout title='Orders'>
      <SearchWithNav
        hideFiltersNav
        onFilterClick={() => {}}
        onUpdate={(qs) => {
          setLocation(appRoutes.list.makePath({}, qs))
        }}
        queryString={search}
        searchBarDebounceMs={1000}
      />

      <SkeletonTemplate isLoading={isLoadingCounters}>
        <Spacer bottom='14'>
          <List title='Open'>
            <Link
              href={appRoutes.list.makePath(
                {},
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.awaitingApproval
                })
              )}
              asChild
            >
              <ListItem
                icon={
                  <StatusIcon
                    name='arrowDown'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.awaitingApproval.viewTitle}{' '}
                  {formatCounter(counters?.awaitingApproval)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link
              href={appRoutes.list.makePath(
                {},
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.paymentToCapture
                })
              )}
              asChild
            >
              <ListItem
                icon={
                  <StatusIcon
                    name='creditCard'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.paymentToCapture.viewTitle}{' '}
                  {formatCounter(counters?.paymentToCapture)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link
              href={appRoutes.list.makePath(
                {},
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.fulfillmentInProgress
                })
              )}
              asChild
            >
              <ListItem
                icon={
                  <StatusIcon
                    name='arrowClockwise'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.fulfillmentInProgress.viewTitle}{' '}
                  {formatCounter(counters?.fulfillmentInProgress)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
            {counters?.editing != null && counters?.editing > 0 && (
              <Link
                href={appRoutes.list.makePath(
                  {},
                  adapters.adaptFormValuesToUrlQuery({
                    formValues: presets.editing
                  })
                )}
                asChild
              >
                <ListItem
                  icon={
                    <StatusIcon
                      name='pencilSimple'
                      background='orange'
                      gap='small'
                    />
                  }
                >
                  <Text weight='semibold'>
                    {presets.editing.viewTitle}{' '}
                    {formatCounter(counters?.editing)}
                  </Text>
                  <StatusIcon name='caretRight' />
                </ListItem>
              </Link>
            )}
          </List>
        </Spacer>

        <Spacer bottom='14'>
          <List title='Browse'>
            <Link
              href={appRoutes.list.makePath(
                {},
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.history
                })
              )}
              asChild
            >
              <ListItem
                icon={
                  <StatusIcon
                    name='asteriskSimple'
                    background='black'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>{presets.history.viewTitle}</Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
            <Link
              href={appRoutes.list.makePath(
                {},
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.pending
                })
              )}
              asChild
            >
              <ListItem icon={<RadialProgress size='small' />}>
                <Text weight='semibold'>{presets.pending.viewTitle}</Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
            <Link
              href={appRoutes.list.makePath(
                {},
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.archived
                })
              )}
              asChild
            >
              <ListItem
                icon={<StatusIcon name='minus' background='gray' gap='small' />}
              >
                <Text weight='semibold'>{presets.archived.viewTitle}</Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
          </List>
        </Spacer>
      </SkeletonTemplate>
    </HomePageLayout>
  )
}

function formatCounter(counter = 0): string {
  return `(${Intl.NumberFormat().format(counter)})`
}

export default Home
