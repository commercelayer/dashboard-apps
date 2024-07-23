import type { FiltersInstructions } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export const instructions: FiltersInstructions = [
  {
    label: 'Origin',
    type: 'options',
    sdk: {
      predicate: 'origin_stock_location_id_in'
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
        filters: {
          disabled_at_null: true
        }
      }
    }
  },
  {
    label: 'Destination',
    type: 'options',
    sdk: {
      predicate: 'destination_stock_location_id_in'
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
        filters: {
          disabled_at_null: true
        }
      }
    }
  },
  {
    label: 'Status',
    type: 'options',
    sdk: {
      predicate: 'status_in',
      defaultOptions: [
        'picking',
        'in_transit',
        'completed',
        'cancelled',
        'on_hold'
      ]
    },

    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          { value: 'picking', label: 'Picking' },
          { value: 'in_transit', label: 'In transit' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'on_hold', label: 'On hold' }
        ]
      }
    }
  },
  {
    label: 'Time Range',
    type: 'timeRange',
    sdk: {
      predicate: 'updated_at'
    },
    render: {
      component: 'dateRangePicker'
    }
  },
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate:
        [
          'number',
          'reference',
          'sku_code',
          'origin_stock_location_name',
          'destination_stock_location_name'
        ].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]
