import { type PackingFormValues } from '#data/packingFormSchema'
import { isMock, repeat } from '#mocks'
import {
  HookedInputRadioGroup,
  HookedInputSelect,
  InputFeedback,
  Spacer,
  Text,
  useCoreApi,
  useCoreSdkProvider,
  useTranslation,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { ListResponse, Package } from '@commercelayer/sdk'
import { useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
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
  const { setValue, watch } = useFormContext<PackingFormValues>()
  const { packages, isLoading } = usePackages(stockLocationId)
  const { t } = useTranslation()

  useEffect(() => {
    // automatically select the first package when there is only one package
    const isMockedData = packages.every(isMock)
    const isSinglePackage = packages.length === 1
    const firstPackageId = packages[0]?.id
    if (
      !isLoading &&
      !isMockedData &&
      isSinglePackage &&
      firstPackageId != null
    ) {
      setValue('packageId', firstPackageId)
    }
  }, [packages, isLoading])

  if (packages.length === 0) {
    return (
      <InputFeedback message={t('apps.shipments.form.no_packages_found')} />
    )
  }

  const selectedPackageId = watch('packageId')

  // render a select when too many packages are found, since radio buttons will take too much space
  if (packages.length > 4) {
    return <InputSelectPackages stockLocationId={stockLocationId} />
  }

  // radio buttons for majority of the cases
  return (
    <HookedInputRadioGroup
      isLoading={isLoading}
      name='packageId'
      viewMode='grid'
      showInput={false}
      key={selectedPackageId}
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
  stockLocationId
}: {
  stockLocationId: string
}): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const { t } = useTranslation()

  const { packages, isLoading } = usePackages(stockLocationId)

  const hasMorePages =
    (packages?.meta?.pageCount != null && packages.meta.pageCount > 1) ?? false

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
      label={t('resources.packages.name')}
      placeholder={t('apps.shipments.form.select_package')}
      isLoading={isLoading}
      isSearchable
      menuFooterText={
        hasMorePages ? t('common.forms.type_to_search_for_more') : undefined
      }
      loadAsyncValues={
        hasMorePages
          ? async (hint) => {
              return await sdkClient.packages
                .list({
                  pageSize: 25,
                  filters: {
                    stock_location_id_eq: stockLocationId,
                    name_cont: hint
                  }
                })
                .then(packagesToSelectOptions)
            }
          : undefined
      }
      initialValues={packagesToSelectOptions(packages)}
    />
  )
}

/** Fetch first 25 packages */
function usePackages(stockLocationId?: string): {
  packages: ListResponse<Package>
  isLoading: boolean
} {
  const { data: packages, isLoading } = useCoreApi(
    'packages',
    'list',
    stockLocationId == null
      ? null
      : [
          {
            fields: [
              'id',
              'name',
              'width',
              'length',
              'height',
              'unit_of_length'
            ],
            filters: {
              stock_location_id_eq: stockLocationId
            },
            pageSize: 25
          }
        ],
    {
      fallbackData: repeat(2, () => makePackage()) as ListResponse<Package>
    }
  )

  return {
    packages,
    isLoading
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
