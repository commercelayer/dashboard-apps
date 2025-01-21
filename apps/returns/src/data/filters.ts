import { t } from '@commercelayer/app-elements'
import type { FiltersInstructions } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export const instructions: FiltersInstructions = [
  {
    label: t('apps.returns.details.return_locations'),
    type: 'options',
    sdk: {
      predicate: 'stock_location_id_in'
    },
    render: {
      component: 'inputResourceGroup',
      props: {
        fieldForLabel: 'name',
        fieldForValue: 'id',
        resource: 'stock_locations',
        searchBy: 'name_cont',
        sortBy: { attribute: 'id', direction: 'asc' },
        previewLimit: 5,
        hideWhenSingleItem: true,
        filters: {
          disabled_at_null: true
        }
      }
    }
  },
  {
    label: t('apps.returns.attributes.status'),
    type: 'options',
    sdk: {
      predicate: 'status_in',
      defaultOptions: [
        'approved',
        'shipped',
        'received',
        'cancelled',
        'rejected',
        'refunded'
      ]
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          {
            value: 'requested',
            label: t('resources.returns.attributes.status.requested')
          },
          {
            value: 'approved',
            label: t('resources.returns.attributes.status.approved')
          },
          {
            value: 'shipped',
            label: t('resources.returns.attributes.status.shipped')
          },
          {
            value: 'received',
            label: t('resources.returns.attributes.status.received')
          },
          {
            value: 'cancelled',
            label: t('resources.returns.attributes.status.cancelled')
          },
          {
            value: 'rejected',
            label: t('resources.returns.attributes.status.rejected')
          },
          {
            value: 'refunded',
            label: t('resources.returns.attributes.status.refunded')
          }
        ]
      }
    }
  },
  {
    label: t('common.time_range'),
    type: 'timeRange',
    sdk: {
      predicate: 'updated_at'
    },
    render: {
      component: 'dateRangePicker'
    }
  },
  {
    label: t('common.search'),
    type: 'textSearch',
    sdk: {
      predicate:
        [
          'number',
          'reference',
          'customer_email',
          'origin_address_email',
          'origin_address_company',
          'origin_address_first_name',
          'origin_address_last_name',
          'origin_address_billing_info',
          'destination_address_email',
          'destination_address_company',
          'destination_address_first_name',
          'destination_address_last_name',
          'destination_address_billing_info'
        ].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]
