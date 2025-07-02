import { Filters } from '#components/Form/Filters'
import { resourcesWithFilters } from '#components/Form/Filters/index'
import { InputCode } from '#components/Form/Filters/InputCode'
import { customFieldsSubset } from '#data/fields'
import { showResourceNiceName } from '#data/resources'
import {
  Button,
  HookedForm,
  HookedInputCheckbox,
  HookedInputSelect,
  Icon,
  Spacer,
  Tab,
  Tabs,
  Tooltip
} from '@commercelayer/app-elements'
import { type AllowedResourceType } from 'App'
import { type ExportFormValues } from 'AppForm'
import { Controller, useForm } from 'react-hook-form'
import { RelationshipSelector } from './RelationshipSelector'

interface Props {
  resourceType: AllowedResourceType
  isLoading?: boolean
  defaultValues: ExportFormValues
  onSubmit: (values: ExportFormValues) => void
}

export function Form({
  isLoading,
  resourceType,
  defaultValues,
  onSubmit
}: Props): React.JSX.Element {
  const methods = useForm<ExportFormValues>({
    defaultValues
  })

  return (
    <HookedForm {...methods} onSubmit={onSubmit}>
      <Spacer bottom='6'>
        <Tabs keepAlive>
          {resourcesWithFilters.includes(resourceType) ? (
            <Tab name='Filters'>
              <Controller
                name='filters'
                control={methods.control}
                render={({ field: { onChange } }) => (
                  <Filters resourceType={resourceType} onChange={onChange} />
                )}
              />
            </Tab>
          ) : null}
          <Tab name='Custom rules'>
            <Controller
              name='filters'
              control={methods.control}
              render={({ field: { onChange } }) => (
                <InputCode
                  onDataReady={onChange}
                  onDataResetRequest={() => {
                    onChange(undefined)
                  }}
                />
              )}
            />
          </Tab>
        </Tabs>
      </Spacer>
      <Spacer bottom='6'>
        <RelationshipSelector resourceType={resourceType} />
      </Spacer>

      <Spacer bottom='6'>
        <HookedInputSelect
          label='Format'
          name='format'
          initialValues={[
            { label: 'JSON', value: 'json' },
            {
              label: 'CSV',
              value: 'csv'
            }
          ]}
        />
      </Spacer>

      <Spacer bottom='2'>
        {customFieldsSubset[resourceType] != null && (
          <HookedInputCheckbox name='useCustomFields'>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
              }}
            >
              Simple format
              <Tooltip
                label={<Icon name='info' />}
                content='Export a predefined selection of key columns for easier use.'
              />
            </div>
          </HookedInputCheckbox>
        )}
      </Spacer>

      <Spacer bottom='14'>
        <HookedInputCheckbox name='dryData'>
          <div
            style={{
              display: 'flex',
              gap: '6px',
              alignItems: 'center'
            }}
          >
            Importable
            <Tooltip
              label={<Icon name='info' />}
              content='Skip IDs, timestamps, and blanks to allow re-import.'
            />
          </div>
        </HookedInputCheckbox>
      </Spacer>

      <Button variant='primary' type='submit' disabled={isLoading}>
        {isLoading === true
          ? 'Exporting...'
          : `Export ${showResourceNiceName(resourceType).toLowerCase()}`}
      </Button>
    </HookedForm>
  )
}
