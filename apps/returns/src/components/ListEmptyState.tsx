import { A, EmptyState, useTranslation } from '@commercelayer/app-elements'

interface Props {
  scope?: 'history' | 'userFiltered' | 'presetView'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  const { t } = useTranslation()

  if (scope === 'presetView') {
    return (
      <EmptyState
        title={t('common.empty_states.all_good_here')}
        description={
          <div>
            <p>
              {t('common.empty_states.no_resources_found_for_list', {
                resources: t('resources.returns.name_other').toLowerCase()
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
        title='No returns found!'
        description={
          <div>
            <p>
              {t('common.empty_states.no_resources_found_for_filters', {
                resources: t('resources.returns.name_other')
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
        resource: t('resources.returns.name').toLowerCase()
      })}
      description={
        <div>
          <p>
            {t('common.empty_states.create_the_first_resource', {
              resource: t('resources.returns.name').toLowerCase()
            })}
          </p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/returns'
            rel='noreferrer'
          >
            {t('common.view_api_docs')}
          </A>
        </div>
      }
    />
  )
}
