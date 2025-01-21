import { t, type FiltersInstructions } from '@commercelayer/app-elements'

export const instructions: FiltersInstructions = [
  {
    label: t('apps.customers.attributes.status'),
    type: 'options',
    sdk: {
      predicate: 'status_in',
      defaultOptions: ['prospect', 'acquired', 'repeat']
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          {
            value: 'prospect',
            label: t('resources.customers.attributes.status.prospect')
          },
          {
            value: 'acquired',
            label: t('resources.customers.attributes.status.acquired')
          },
          {
            value: 'repeat',
            label: t('resources.customers.attributes.status.repeat')
          }
        ]
      }
    }
  },
  {
    label: t('apps.customers.details.type'),
    type: 'options',
    sdk: {
      predicate: 'password_present',
      parseFormValue: (value) =>
        Array.isArray(value) && value.length === 1
          ? value[0] === 'registered'
          : undefined
    },
    render: {
      component: 'inputToggleButton',
      props: {
        mode: 'multi',
        options: [
          { value: 'guest', label: t('apps.customers.details.guest') },
          { value: 'registered', label: t('apps.customers.details.registered') }
        ]
      }
    }
  },
  {
    label: t('apps.customers.details.groups'),
    type: 'options',
    sdk: {
      predicate: 'customer_group_id_in'
    },
    render: {
      component: 'inputResourceGroup',
      props: {
        fieldForLabel: 'name',
        fieldForValue: 'id',
        resource: 'customer_groups',
        searchBy: 'name_cont',
        sortBy: { attribute: 'name', direction: 'asc' },
        previewLimit: 5
      }
    }
  },
  {
    label: t('resources.tags.name_other'),
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
    label: t('common.search'),
    type: 'textSearch',
    sdk: {
      predicate: ['email', 'customer_group_name'].join('_or_') + '_cont'
    },
    render: {
      component: 'searchBar'
    }
  }
]
