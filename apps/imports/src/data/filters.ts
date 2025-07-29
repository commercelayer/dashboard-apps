import { type FiltersInstructions } from '@commercelayer/app-elements'

export const instructions: FiltersInstructions = [
  {
    label: 'Status',
    type: 'options',
    sdk: {
      predicate: 'status_in',
      defaultOptions: ['pending', 'in_progress', 'interrupted', 'completed']
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          {
            value: 'pending',
            label: 'Pending'
          },
          {
            value: 'in_progress',
            label: 'In Progress'
          },
          {
            value: 'interrupted',
            label: 'Interrupted'
          },
          {
            value: 'completed',
            label: 'Completed'
          }
        ]
      }
    }
  },
  {
    label: 'Time range',
    type: 'timeRange',
    sdk: {
      predicate: 'created_at'
    },
    render: {
      component: 'dateRangePicker'
    }
  },
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate: 'resource_type_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]
