import { filtersInstructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  HomePageLayout,
  List,
  ListItem,
  SkeletonTemplate,
  Spacer,
  StatusIcon,
  Text,
  useResourceFilters,
  useTranslation
} from '@commercelayer/app-elements'
import { useCallback } from 'react'
import { Link, useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'
import { useListCounters } from '../metricsApi/useListCounters'

function Home(): JSX.Element {
  const search = useSearch()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()

  const { data: counters, isLoading: isLoadingCounters } = useListCounters()

  const { SearchWithNav, adapters } = useResourceFilters({
    instructions: filtersInstructions
  })

  const getPresetUrl = useCallback(
    (presetKey: keyof typeof presets): string => {
      const preset = presets[presetKey]
      return appRoutes.list.makePath(
        {},
        adapters.adaptFormValuesToUrlQuery({
          formValues: {
            status_in: [preset.status_eq as string],
            viewTitle: preset.viewTitle
          }
        })
      )
    },
    []
  )

  return (
    <HomePageLayout title={t('resources.shipments.name_other')}>
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
          <List title={t('apps.shipments.tasks.pending')}>
            <Link href={getPresetUrl('picking')} asChild>
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
                  {t('apps.shipments.tasks.picking')}{' '}
                  {formatCounter(counters?.picking)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link href={getPresetUrl('packing')} asChild>
              <ListItem
                icon={
                  <StatusIcon name='package' background='orange' gap='small' />
                }
              >
                <Text weight='semibold'>
                  {t('apps.shipments.tasks.packing')}{' '}
                  {formatCounter(counters?.packing)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link href={getPresetUrl('readyToShip')} asChild>
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
                  {t('apps.shipments.tasks.ready_to_ship')}{' '}
                  {formatCounter(counters?.readyToShip)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link href={getPresetUrl('onHold')} asChild>
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
                  {t('apps.shipments.tasks.on_hold')}{' '}
                  {formatCounter(counters?.onHold)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
          </List>
        </Spacer>
      </SkeletonTemplate>

      <Spacer bottom='14'>
        <List title={t('apps.shipments.tasks.browse')}>
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
              <Text weight='semibold'>
                {t('apps.shipments.tasks.all_shipments')}
              </Text>
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

export default Home
