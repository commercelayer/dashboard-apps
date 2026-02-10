import {
  Button,
  EmptyState,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Sku, SkuList } from '@commercelayer/sdk'
import { Link } from 'wouter'
import { linksRoutes } from '../data/routes'

interface Props {
  scope: 'no-sales-channels' | 'no-public-markets' | 'no-links'
  resourceId: Sku['id'] | SkuList['id']
  resourceType: 'skus' | 'sku_lists'
}

/**
 * Empty state component for the Links tab on resource details pages.
 *
 * Displays appropriate messaging based on whether the organization has
 * sales channels configured and whether the user has permission to create links.
 *
 * @param scope - The type of empty state to display:
 *   - 'no-sales-channels': When the organization has no sales channels configured
 *   - 'no-public-markets': When sales channels exist but no public markets are available
 *   - 'no-links': When sales channels exist but no links have been created yet
 * @param resourceId - The ID of the parent resource (SKU or SKU List)
 * @param resourceType - The type of resource ('skus' or 'sku_lists')
 *
 * @example
 * ```tsx
 * <LinksEmptyState
 *   scope={hasSalesChannels ? 'no-links' : 'no-sales-channels'}
 *   resourceId={skuId}
 *   resourceType='skus'
 * />
 * ```
 */
export function LinksEmptyState({
  scope,
  resourceId,
  resourceType: _resourceType
}: Props): React.JSX.Element {
  const { canUser, role, settings } = useTokenProvider()

  if (scope === 'no-sales-channels') {
    return (
      <EmptyState
        title='Sales channels required'
        description='To create shareable links for this resource, your organization needs at least one sales channel configured.'
        action={
          role?.kind === 'admin' && (
            <a
              href={`${settings.dashboardUrl}/api-credentials/new`}
              target='_blank'
              rel='noreferrer'
            >
              <Button variant='primary'>Configure sales channels</Button>
            </a>
          )
        }
      />
    )
  }

  if (scope === 'no-public-markets') {
    return (
      <EmptyState
        title='Public market required'
        description='To create shareable links for this resource, your organization needs at least one public market configured.'
        action={
          role?.kind === 'admin' && (
            <a
              href={`${settings.dashboardUrl}/settings/markets/new`}
              target='_blank'
              rel='noreferrer'
            >
              <Button variant='primary'>Configure public markets</Button>
            </a>
          )
        }
      />
    )
  }

  // scope === 'no-links'
  if (!canUser('create', 'links')) {
    return (
      <EmptyState
        title='No links yet'
        description='This resource has no shareable links.'
      />
    )
  }

  return (
    <EmptyState
      title='No links yet'
      description='Create your first shareable link for this resource.'
      action={
        canUser('create', 'links') && (
          <Link href={linksRoutes.linksNew.makePath({ resourceId })}>
            <Button variant='primary'>New link</Button>
          </Link>
        )
      }
    />
  )
}
