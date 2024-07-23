import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  HomePageLayout,
  Icon,
  List,
  ListItem,
  SkeletonTemplate,
  Spacer,
  StatusIcon,
  Text,
  useResourceFilters
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'
import { useListCounters } from '../metricsApi/useListCounters'

export function Home(): JSX.Element {
  const [, setLocation] = useLocation()
  const search = useSearch()
  const { data: counters, isLoading: isLoadingCounters } = useListCounters()

  const { adapters, SearchWithNav } = useResourceFilters({
    instructions
  })

  return (
    <HomePageLayout title='Returns'>
      <SearchWithNav
        hideFiltersNav
        onFilterClick={() => {}}
        onUpdate={(qs) => {
          setLocation(appRoutes.list.makePath(qs))
        }}
        queryString={search}
      />

      <SkeletonTemplate isLoading={isLoadingCounters}>
        <Spacer bottom='14'>
          <List title='Open'>
            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.requested
                })
              )}
              asChild
            >
              <ListItem
                icon={
                  <StatusIcon
                    name='chatCircle'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.requested.viewTitle}{' '}
                  {formatCounter(counters?.requested)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>

            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.approved
                })
              )}
              asChild
            >
              <ListItem
                icon={
                  <StatusIcon name='check' background='orange' gap='small' />
                }
              >
                <Text weight='semibold'>
                  {presets.approved.viewTitle}{' '}
                  {formatCounter(counters?.approved)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>

            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.shipped
                })
              )}
              asChild
            >
              <ListItem
                icon={
                  <StatusIcon
                    name='arrowUpRight'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.shipped.viewTitle} {formatCounter(counters?.shipped)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>
          </List>
        </Spacer>

        <Spacer bottom='14'>
          <List title='Browse'>
            <Link
              href={appRoutes.list.makePath(
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
                <Icon name='caretRight' />
              </ListItem>
            </Link>
            <Link
              href={appRoutes.list.makePath(
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
                <Icon name='caretRight' />
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
