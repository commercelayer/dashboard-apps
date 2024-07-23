import { type AllowedResourceType } from 'App'
import { type ExportFormValues } from 'AppForm'
import { showResourceNiceName } from '#data/resources'
import {
  Spacer,
  Button,
  Tabs,
  Tab,
  ListItem,
  HookedInputSimpleSelect,
  HookedInputSwitch,
  Section,
  HookedForm
} from '@commercelayer/app-elements'
import { RelationshipSelector } from './RelationshipSelector'
import { Filters } from '#components/Form/Filters'
import { resourcesWithFilters } from '#components/Form/Filters/index'
import { InputCode } from '#components/Form/Filters/InputCode'
import { Controller, useForm } from 'react-hook-form'

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
}: Props): JSX.Element {
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
      <Spacer bottom='14'>
        <RelationshipSelector resourceType={resourceType} />
      </Spacer>

      <Spacer bottom='14'>
        <Section title='More options' titleSize='small'>
          <ListItem>
            <HookedInputSwitch
              id='toggle-cleanup'
              inline
              label='Dry data'
              hint={{
                text: 'Enable this flag to make the data importable.'
              }}
              name='dryData'
            />
          </ListItem>
          <ListItem>
            <HookedInputSimpleSelect
              id='format'
              label='Format'
              hint={{
                text: 'Select the format of the exported data.'
              }}
              name='format'
              options={[
                { label: 'JSON', value: 'json' },
                {
                  label: 'CSV',
                  value: 'csv'
                }
              ]}
              inline
            />
          </ListItem>
        </Section>
      </Spacer>

      <Button variant='primary' type='submit' disabled={isLoading}>
        {isLoading === true
          ? 'Exporting...'
          : `Export ${showResourceNiceName(resourceType).toLowerCase()}`}
      </Button>
    </HookedForm>
  )
}
