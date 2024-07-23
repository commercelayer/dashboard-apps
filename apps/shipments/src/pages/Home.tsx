import { getShipmentStatusName } from '#data/dictionaries'
import { filtersInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  HomePageLayout,
  List,
  ListItem,
  SkeletonTemplate,
  Spacer,
  StatusIcon,
  Text,
  useResourceFilters
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'
import { useCallback } from 'react'
import { Link, useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'
import { useListCounters } from '../metricsApi/useListCounters'

export function Home(): JSX.Element {
  const search = useSearch()
  const [, setLocation] = useLocation()

  const { data: counters, isLoading: isLoadingCounters } = useListCounters()

  const { SearchWithNav, adapters } = useResourceFilters({
    instructions: filtersInstructions
  })

  const getPresetUrlByStatus = useCallback(
    (status: Shipment['status']): string => {
      return appRoutes.list.makePath(
        {},
        adapters.adaptFormValuesToUrlQuery({
          formValues: {
            status_in: [status],
            viewTitle: getShipmentStatusName(status)
          }
        })
      )
    },
    []
  )

  return (
    <HomePageLayout title='Shipments'>
      <SearchWithNav
        hideFiltersNav
        onFilterClick={() => {}}
        onUpdate={(qs) => {
          setLocation(appRoutes.list.makePath({}, qs))
        }}
        queryString={search}
      />

      <SkeletonTemplate isLoading={isLoadingCounters}>
        <Spacer bottom='14'>
          <List title='Pending'>
            <Link href={getPresetUrlByStatus('picking')} asChild>
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
                  Picking {formatCounter(counters?.picking)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link href={getPresetUrlByStatus('packing')} asChild>
              <ListItem
                icon={
                  <StatusIcon name='package' background='orange' gap='small' />
                }
              >
                <Text weight='semibold'>
                  Packing {formatCounter(counters?.packing)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link href={getPresetUrlByStatus('ready_to_ship')} asChild>
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
                  Ready to ship {formatCounter(counters?.readyToShip)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link href={getPresetUrlByStatus('on_hold')} asChild>
              <ListItem
                icon={
                  <StatusIcon
                    name='hourglass'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  On hold {formatCounter(counters?.onHold)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
          </List>
        </Spacer>
      </SkeletonTemplate>

      <Spacer bottom='14'>
        <List title='Browse'>
          <Link href={appRoutes.list.makePath({})} asChild>
            <ListItem
              icon={
                <StatusIcon
                  name='asteriskSimple'
                  background='black'
                  gap='small'
                />
              }
            >
              <Text weight='semibold'>All shipments</Text>
              <StatusIcon name='caretRight' />
            </ListItem>
          </Link>
        </List>
      </Spacer>
    </HomePageLayout>
  )
}

function formatCounter(counter = 0): string {
  return `(${Intl.NumberFormat().format(counter)})`
}
