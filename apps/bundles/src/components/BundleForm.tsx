import { ListItemSkuListItem } from '#components/ListItemSkuListItem'
import { MarketWithCurrencySelector } from '#components/MarketWithCurrencySelector'
import { SkuListsSelect } from '#components/SkuListsSelect'
import { useSkuListItems } from '#hooks/useSkuListItems'
import { useSkuListsList } from '#hooks/useSkuListsList'
import {
  Avatar,
  Button,
  ButtonImageSelect,
  Card,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputCurrency,
  HookedInputTextArea,
  HookedValidationApiError,
  Icon,
  PageLayout,
  Section,
  Spacer,
  Text,
  getUnitsOfWeightForSelect,
  useOverlay,
  type InputCurrencyProps,
  type UnitOfWeight
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

const unitsOfWeightForSelect = getUnitsOfWeightForSelect()

export function isValidUnitOfWeight(value: string): value is UnitOfWeight {
  return (
    unitsOfWeightForSelect.filter(
      (unitOfWeight) => unitOfWeight.value === value
    ).length === 1
  )
}

const bundleFormSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  image_url: z.string().optional(),
  sku_list: z.string().min(1),
  market: z.string().optional(),
  currency_code: z.string().min(1),
  price: z.number(),
  original_price: z.number()
})

export type BundleFormValues = z.infer<typeof bundleFormSchema>

interface Props {
  defaultValues?: Partial<BundleFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: BundleFormValues,
    setError: UseFormSetError<BundleFormValues>
  ) => void
  apiError?: any
}

export function BundleForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const bundleFormMethods = useForm<BundleFormValues>({
    defaultValues,
    resolver: zodResolver(bundleFormSchema)
  })

  const bundleFormWatchedImageUrl = bundleFormMethods.watch('image_url')
  const bundleFormWatchedCurrenctyCode =
    bundleFormMethods.watch('currency_code')
  const bundleFormWatchedSkuList = bundleFormMethods.watch('sku_list')

  const { skuListItems } = useSkuListItems(bundleFormWatchedSkuList ?? '')

  const { skuLists } = useSkuListsList({})

  const isLoadingSkuLists = skuLists === undefined

  const { Overlay: ImageOverlay, open, close } = useOverlay()

  const imageFormMethods = useForm({
    defaultValues: {
      name: defaultValues?.name,
      image_url: defaultValues?.image_url
    },
    resolver: zodResolver(
      z.object({
        image_url: z.string()
      })
    )
  })

  const imageFormWatchedImageUrl = imageFormMethods.watch('image_url')

  const {
    formState: { isSubmitting: isSubmittingImage }
  } = imageFormMethods

  return (
    <>
      <HookedForm
        {...bundleFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, bundleFormMethods.setError)
        }}
      >
        <Section title='Basic info'>
          <Spacer top='6' bottom='4'>
            <HookedInput
              name='name'
              label='Name'
              hint={{
                text: (
                  <Text variant='info'>
                    Pick a name that helps you identify it.
                  </Text>
                )
              }}
            />
          </Spacer>
          <Spacer top='6' bottom='4'>
            <HookedInput
              name='code'
              label='Bundle code'
              hint={{
                text: (
                  <Text variant='info'>
                    A unique code to identify the product variant.{' '}
                    <a
                      href='https://docs.commercelayer.io/core/v/api-reference/bundles'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Learn more.
                    </a>
                  </Text>
                )
              }}
            />
          </Spacer>
          <Spacer top='6' bottom='12'>
            <Grid columns='auto'>
              <HookedInputTextArea
                name='description'
                label='Description'
                placeholder='A brief description'
                hint={{
                  text: (
                    <Text variant='info'>Best suited for internal use.</Text>
                  )
                }}
                className='h-[96px]'
              />
              <div className='mt-8'>
                <ButtonImageSelect
                  img={
                    bundleFormWatchedImageUrl != null &&
                    bundleFormWatchedImageUrl.length > 0
                      ? {
                          src: bundleFormWatchedImageUrl,
                          alt: defaultValues?.name ?? ''
                        }
                      : undefined
                  }
                  onClick={() => {
                    open()
                  }}
                />
              </div>
            </Grid>
          </Spacer>
        </Section>

        <Section title='Bundle items'>
          <Spacer top='4' bottom='4'>
            <Text variant='info'>
              Select the manual SKU list containing the bundle items.
            </Text>
          </Spacer>
          <Spacer top='4' bottom='12'>
            {!isLoadingSkuLists && <SkuListsSelect options={skuLists} />}
            {bundleFormWatchedSkuList != null && (
              <Spacer top='4' bottom='2'>
                <Card gap='none'>
                  {skuListItems != null
                    ? skuListItems.map((item) => (
                        <ListItemSkuListItem
                          key={item.sku_code}
                          resource={item}
                        />
                      ))
                    : null}
                </Card>
              </Spacer>
            )}
          </Spacer>
        </Section>

        <Section title='Selling info'>
          <Spacer top='6'>
            <MarketWithCurrencySelector
              defaultMarketId={defaultValues?.market ?? ''}
              defaultCurrencyCode={defaultValues?.currency_code ?? 'USD'}
              hint='The market where this bundle is available.'
            />
          </Spacer>
          <Spacer top='6'>
            <Grid columns='2'>
              <HookedInputCurrency
                name='price'
                label='Price'
                currencyCode={
                  bundleFormWatchedCurrenctyCode as InputCurrencyProps['currencyCode']
                }
                hint={{ text: 'The cost of the complete bundle.' }}
              />
              <HookedInputCurrency
                name='original_price'
                label='Original price'
                currencyCode={
                  bundleFormWatchedCurrenctyCode as InputCurrencyProps['currencyCode']
                }
                hint={{ text: 'The regular cost of the bundle.' }}
              />
            </Grid>
          </Spacer>
        </Section>

        <Spacer top='14'>
          <Button
            type='submit'
            disabled={isSubmitting || isLoadingSkuLists}
            className='w-full'
          >
            {defaultValues?.name == null ? 'Create' : 'Update'}
          </Button>
          <Spacer top='2'>
            <HookedValidationApiError apiError={apiError} />
          </Spacer>
        </Spacer>
      </HookedForm>
      <ImageOverlay>
        <HookedForm
          {...imageFormMethods}
          onSubmit={async (values) => {
            bundleFormMethods.setValue('image_url', values.image_url)
            close()
          }}
        >
          <PageLayout
            title='Set Image'
            minHeight={false}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: `Back`,
              icon: 'arrowLeft'
            }}
          >
            <Avatar
              alt={defaultValues?.name ?? ''}
              src={imageFormWatchedImageUrl as `https://${string}`}
              size='large'
            />
            <Spacer top='8' bottom='8'>
              <div className='relative'>
                <HookedInput
                  disabled={isSubmittingImage}
                  label='Image url'
                  name='image_url'
                  hint={{ text: 'Any valid image URL, hosted anywhere.' }}
                />
                <div
                  className='block text-black absolute bg-white cursor-pointer'
                  style={{
                    right: '16px',
                    top: '43px',
                    paddingLeft: '16px'
                  }}
                  onClick={() => {
                    imageFormMethods.setValue('image_url', '')
                  }}
                >
                  <Icon
                    name='x'
                    size={22}
                    weight='bold'
                    className='hover:opacity-80'
                  />
                </div>
              </div>
            </Spacer>
            <Button type='submit' fullWidth disabled={isSubmittingImage}>
              Apply
            </Button>
          </PageLayout>
        </HookedForm>
      </ImageOverlay>
    </>
  )
}
