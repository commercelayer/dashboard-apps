import type { FiltersInstructions } from '@commercelayer/app-elements'

export const instructions: FiltersInstructions = [
  {
    label: 'Markets',
    type: 'options',
    sdk: {
      predicate: 'market_id_in'
    },
    render: {
      component: 'inputResourceGroup',
      props: {
        fieldForLabel: 'name',
        fieldForValue: 'id',
        resource: 'markets',
        searchBy: 'name_cont',
        sortBy: { attribute: 'name', direction: 'asc' },
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
      defaultOptions: ['inactive', 'active', 'redeemed']
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          { value: 'draft', label: 'Draft', isHidden: true },
          { value: 'inactive', label: 'Inactive' },
          { value: 'active', label: 'Active' },
          { value: 'redeemed', label: 'Redeemed' }
        ]
      }
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
      predicate: 'code_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]