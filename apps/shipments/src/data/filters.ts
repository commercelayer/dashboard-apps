import { getShipmentStatusName } from '#data/dictionaries'
import type { FiltersInstructions } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'
import type { Shipment } from '@commercelayer/sdk'

const allowedStatuses: Array<Shipment['status']> = [
  'picking',
  'packing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'on_hold'
]

const textSearchPredicate = ['number', 'reference'].join('_or_') + '_cont'

export const filtersInstructions: FiltersInstructions = [
  {
    label: 'Stock locations',
    type: 'options',
    sdk: {
      predicate: 'stock_location_id_in'
    },
    render: {
      component: 'inputResourceGroup',
      props: {
        resource: 'stock_locations',
        fieldForLabel: 'name',
        fieldForValue: 'id',
        searchBy: 'name_cont',
        sortBy: { attribute: 'updated_at', direction: 'desc' },
        previewLimit: 5
      }
    }
  },
  {
    label: 'Status',
    type: 'options',
    sdk: {
      predicate: 'status_in',
      defaultOptions: allowedStatuses
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: allowedStatuses.map((status) => ({
          value: status,
          label: getShipmentStatusName(status)
        }))
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
    label: 'Tags',
    type: 'options',
    sdk: {
      predicate: 'tags_id_in'
    },
    render: {
      component: 'inputResourceGroup',
      props: {
        fieldForLabel: 'name',
        fieldForValue: 'id',
        resource: 'tags',
        searchBy: 'name_cont',
        sortBy: { attribute: 'name', direction: 'asc' },
        previewLimit: 5,
        showCheckboxIcon: false
      }
    }
  },
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate: textSearchPredicate
    },
    render: {
      component: 'searchBar'
    }
  }
]
