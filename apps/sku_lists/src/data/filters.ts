import type { FiltersInstructions } from '@commercelayer/app-elements'

export const instructions: FiltersInstructions = [
  {
    label: 'Search',
    type: 'textSearch',
    sdk: {
      predicate: ['slug', 'name'].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]
