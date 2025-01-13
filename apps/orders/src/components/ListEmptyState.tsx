import {
  A,
  EmptyState,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered' | 'presetView' | 'noSKUs' | 'noBundles'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  const { t } = useTranslation()
  const { canUser } = useTokenProvider()

  if (scope === 'presetView') {
    return (
      <EmptyState
        title={t('common.empty_states.all_good_here')}
        description={
          <div>
            <p>
              {t('common.empty_states.no_resources_found_for_list', {
                resources: t('resources.orders.name_other').toLowerCase()
              })}
            </p>
          </div>
        }
      />
    )
  }

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title={t('common.empty_states.no_resource_found', {
          resource: t('resources.orders.name').toLowerCase()
        })}
        description={
          <div>
            <p>
              {t('common.empty_states.no_resources_found_for_filters', {
                resources: t('resources.orders.name_other').toLowerCase()
              })}
            </p>
          </div>
        }
      />
    )
  }

  if (scope === 'noSKUs') {
    return (
      <EmptyState
        title={t('common.empty_states.no_resource_found', {
          resource: t('resources.skus.name').toLowerCase()
        })}
        description={
          <div>
            <p>
              {t('common.empty_states.no_resources_found_for_filters', {
                resources: t('resources.skus.name').toLowerCase()
              })}
            </p>
          </div>
        }
      />
    )
  }

  if (scope === 'noBundles') {
    return (
      <EmptyState
        title={t('common.empty_states.no_resource_found', {
          resource: t('resources.bundles.name').toLowerCase()
        })}
        description={
          <div>
            <p>
              {t('common.empty_states.no_resources_found_for_filters', {
                resources: t('resources.bundles.name').toLowerCase()
              })}
            </p>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      title={t('common.empty_states.no_resource_yet', {
        resource: t('resources.orders.name').toLowerCase()
      })}
      description={
        canUser('create', 'orders') ? (
          <div>
            <p>
              {t('common.empty_states.create_the_first_resource', {
                resource: t('resources.orders.name').toLowerCase()
              })}
            </p>
            <A
              target='_blank'
              href='https://docs.commercelayer.io/core/v/api-reference/orders'
              rel='noreferrer'
            >
              {t('common.view_api_docs')}
            </A>
          </div>
        ) : null
      }
    />
  )
}
