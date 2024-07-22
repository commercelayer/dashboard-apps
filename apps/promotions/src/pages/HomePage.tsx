import { filtersInstructions, predicateWhitelist } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import { usePromotionPermission } from '#hooks/usePromotionPermission'
import {
  A,
  HomePageLayout,
  Icon,
  List,
  ListItem,
  RadialProgress,
  Spacer,
  StatusIcon,
  Text,
  useResourceFilters
} from '@commercelayer/app-elements'
import { Link, useLocation, useSearch } from 'wouter'

function HomePage(): JSX.Element {
  const { canUserManagePromotions } = usePromotionPermission()

  const search = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, adapters } = useResourceFilters({
    instructions: filtersInstructions,
    predicateWhitelist
  })

  return (
    <HomePageLayout title='Promotions'>
      <SearchWithNav
        hideFiltersNav
        onFilterClick={() => {}}
        onUpdate={(qs) => {
          setLocation(appRoutes.promotionList.makePath({}, qs))
        }}
        queryString={search}
      />

      <Spacer top='14'>
        <List
          title='Browse'
          actionButton={
            canUserManagePromotions('create', 'atLeastOne') ? (
              <Link asChild href={appRoutes.newSelectType.makePath({})}>
                <A href='' variant='secondary' size='mini' alignItems='center'>
                  <Icon name='plus' />
                  New
                </A>
              </Link>
            ) : undefined
          }
        >
          <Link
            href={appRoutes.promotionList.makePath(
              {},
              adapters.adaptFormValuesToUrlQuery({
                formValues: presets.active
              })
            )}
            asChild
          >
            <ListItem
              icon={<StatusIcon name='pulse' background='green' gap='small' />}
            >
              <Text weight='semibold'>{presets.active.viewTitle} </Text>
              <StatusIcon name='caretRight' />
            </ListItem>
          </Link>

          <Link
            href={appRoutes.promotionList.makePath(
              {},
              adapters.adaptFormValuesToUrlQuery({
                formValues: presets.upcoming
              })
            )}
            asChild
          >
            <ListItem icon={<RadialProgress size='small' />}>
              <Text weight='semibold'>{presets.upcoming.viewTitle} </Text>
              <StatusIcon name='caretRight' />
            </ListItem>
          </Link>

          <Link
            href={appRoutes.promotionList.makePath(
              {},
              adapters.adaptFormValuesToUrlQuery({
                formValues: presets.disabled
              })
            )}
            asChild
          >
            <ListItem
              icon={
                <StatusIcon name='minus' background='lightGray' gap='small' />
              }
            >
              <Text weight='semibold'>{presets.disabled.viewTitle} </Text>
              <StatusIcon name='caretRight' />
            </ListItem>
          </Link>

          <Link asChild href={appRoutes.promotionList.makePath({})}>
            <ListItem
              icon={
                <StatusIcon
                  name='asteriskSimple'
                  background='black'
                  gap='small'
                />
              }
            >
              <Text weight='semibold'>All promotions</Text>
              <Icon name='caretRight' />
            </ListItem>
          </Link>
        </List>
      </Spacer>
    </HomePageLayout>
  )
}

export default HomePage
