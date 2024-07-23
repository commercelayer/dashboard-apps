import { repeat } from '#mocks'
import {
  HookedInputRadioGroup,
  HookedInputSelect,
  InputFeedback,
  Spacer,
  Text,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { ListResponse, Package, QueryParamsList } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import { useCallback } from 'react'
import { makePackage } from 'src/mocks/resources/packages'

interface Props {
  /**
   * Will be used retrieve the available packages
   */
  stockLocationId: string
}

export function FormPackingFieldPackages({
  stockLocationId
}: Props): JSX.Element {
  const { data: packages, isLoading } = useCoreApi(
    'packages',
    'list',
    [makePackageQuery(stockLocationId)],
    {
      fallbackData: repeat(2, () => makePackage()) as ListResponse<Package>
    }
  )

  if (packages.length === 0) {
    return (
      <InputFeedback message='No packages found for current stock location' />
    )
  }

  // render a select when too many packages are found, since radio buttons will take too much space
  if (packages.length > 4) {
    return (
      <InputSelectPackages
        packages={packages}
        stockLocationId={stockLocationId}
      />
    )
  }

  // radio buttons for majority of the cases
  return (
    <HookedInputRadioGroup
      isLoading={isLoading}
      name='packageId'
      viewMode='grid'
      showInput={false}
      options={packages.map((item) => ({
        value: item.id,
        content: (
          <>
            <Spacer bottom='2'>
              <Text weight='bold' tag='div'>
                {item.name}
              </Text>
            </Spacer>
            <Text variant='info'>{makeSizeString(item)}</Text>
          </>
        )
      }))}
    />
  )
}

/**
 * InputSelect component to be used when multiple packages are found
 */
function InputSelectPackages({
  packages,
  stockLocationId
}: {
  packages: Package[]
  stockLocationId: string
}): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()

  const packagesToSelectOptions = useCallback(
    (packages: Package[]): InputSelectValue[] =>
      packages.map((item) => ({
        value: item.id,
        label: `${item.name} - ${makeSizeString(item)}`
      })),
    []
  )

  return (
    <HookedInputSelect
      name='packageId'
      placeholder='Select a package'
      loadAsyncValues={async (hint) => {
        return await sdkClient.packages
          .list(makePackageQuery(stockLocationId, hint))
          .then(packagesToSelectOptions)
      }}
      initialValues={packagesToSelectOptions(packages)}
    />
  )
}

/**
 * Generate a valid SDK query object to retrieve the available packages with optional hint to filter by name
 */
function makePackageQuery(
  stockLocationId: string,
  hint?: string
): QueryParamsList<Package> {
  return {
    fields: ['id', 'name', 'width', 'length', 'height', 'unit_of_length'],
    filters: {
      stock_location_id_eq: stockLocationId,
      ...(!isEmpty(hint) && { name_cont: hint })
    },
    pageSize: 25
  }
}

/**
 * Generate a string with the package size in the following formats:
 * 50 × 45.30 × 20 cm
 * In case of integer values, the decimal part is removed (eg: 20.00 => 20)
 */
function makeSizeString({
  width,
  length,
  height,
  unit_of_length: unit
}: Package): string {
  function roundIfInteger(value: string | number): string {
    const float = parseFloat(`${value}`)
    return Number.isInteger(float) ? float.toString() : float.toFixed(0)
  }

  return `${roundIfInteger(width)} × ${roundIfInteger(
    length
  )} × ${roundIfInteger(height)} ${unit}`
}
