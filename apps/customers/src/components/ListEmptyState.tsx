import {
  A,
  Button,
  EmptyState,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { Link } from 'wouter'

import { appRoutes } from '#data/routes'

interface Props {
  scope?: 'history' | 'userFiltered' | 'presetView'
}

export function ListEmptyState({ scope = 'history' }: Props): JSX.Element {
  const { canUser } = useTokenProvider()
  const { t } = useTranslation()

  if (scope === 'history') {
    return (
      <EmptyState
        title={t('common.empty_states.no_resource_yet', {
          resource: t('resources.customers.name').toLowerCase()
        })}
        description={
          canUser('create', 'customers')
            ? t('common.empty_states.create_the_first_resource', {
                resource: t('resources.customers.name').toLowerCase()
              })
            : undefined
        }
        action={
          canUser('create', 'customers') && (
            <Link href={appRoutes.new.makePath()}>
              <Button variant='primary'>
                {t('common.add_resource', {
                  resource: t('resources.customers.name').toLowerCase()
                })}
              </Button>
            </Link>
          )
        }
      />
    )
  }

  if (scope === 'userFiltered') {
    return (
      <EmptyState
        title={t('common.empty_states.no_resource_found', {
          resource: t('resources.customers.name').toLowerCase()
        })}
        description={
          <div>
            <p>
              {t('common.empty_states.no_resources_found_for_filters', {
                resources: t('resources.customers.name').toLowerCase()
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
        resource: t('resources.customers.name').toLowerCase()
      })}
      description={
        <div>
          <p>
            {t('common.empty_states.create_the_first_resource', {
              resource: t('resources.customers.name').toLowerCase()
            })}
          </p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/customers'
            rel='noreferrer'
          >
            {t('common.view_api_docs')}
          </A>
        </div>
      }
    />
  )
}
