import { useShippingCategoriesList } from '#hooks/useShippingCategoriesList'
import {
  Avatar,
  Button,
  ButtonImageSelect,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputCheckbox,
  HookedInputSelect,
  HookedInputTextArea,
  HookedValidationApiError,
  Icon,
  PageLayout,
  Section,
  Spacer,
  Text,
  getUnitsOfWeightForSelect,
  useOverlay,
  type UnitOfWeight
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import isEmpty from 'lodash/isEmpty'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { ShippingCategorySelect } from './ShippingCategorySelect'

const unitsOfWeightForSelect = getUnitsOfWeightForSelect()

export function isValidUnitOfWeight(value: string): value is UnitOfWeight {
  return (
    unitsOfWeightForSelect.filter(
      (unitOfWeight) => unitOfWeight.value === value
    ).length === 1
  )
}

const skuFormSchema = z
  .object({
    id: z.string().optional(),
    code: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    shippingCategory: z.string().optional().nullable(),
    piecesPerPack: z.string().optional(),
    hsTariffNumber: z.string().optional(),
    doNotShip: z.boolean().optional(),
    doNotTrack: z.boolean().optional(),
    weight: z.string().length(0).or(z.undefined()).or(z.string().min(1)),
    unitOfWeight: z.string()
  })
  .superRefine((values, ctx) => {
    if (values.doNotShip !== true && isEmpty(values.shippingCategory)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingCategory'],
        message: 'Please select a shipping category'
      })
    }
  })

export type SkuFormValues = z.infer<typeof skuFormSchema>

interface Props {
  defaultValues?: Partial<SkuFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: SkuFormValues,
    setError: UseFormSetError<SkuFormValues>
  ) => void
  apiError?: any
}

export function SkuForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const skuFormMethods = useForm<SkuFormValues>({
    defaultValues,
    resolver: zodResolver(skuFormSchema)
  })
  const skuFormWatchedImageUrl = skuFormMethods.watch('imageUrl')

  const { shippingCategories } = useShippingCategoriesList({})
  /*
   * `isLoadingShippingCategories` is needed/wanted here because `isLoading` prop available from `useCoreApi` does not reflect with precision the fact that data is filled or not.
   * It might happen that `isLoading` is `false` and `shippingCategories` is still `undefined` for a while.
   */
  const isLoadingShippingCategories = shippingCategories === undefined

  const { Overlay: ImageOverlay, open, close } = useOverlay()

  const imageFormMethods = useForm({
    defaultValues: {
      name: defaultValues?.name,
      imageUrl: defaultValues?.imageUrl
    },
    resolver: zodResolver(
      z.object({
        imageUrl: z.string()
      })
    )
  })

  const imageFormWatchedImageUrl = imageFormMethods.watch('imageUrl')

  const {
    formState: { isSubmitting: isSubmittingImage }
  } = imageFormMethods

  return (
    <>
      <HookedForm
        {...skuFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, skuFormMethods.setError)
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
              label='SKU code'
              hint={{
                text: (
                  <Text variant='info'>
                    A unique code to identify the product variant.{' '}
                    <a
                      href='https://docs.commercelayer.io/core/v/api-reference/skus'
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
                    skuFormWatchedImageUrl != null &&
                    skuFormWatchedImageUrl.length > 0
                      ? {
                          src: skuFormWatchedImageUrl,
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

        <Section title='Shipping info'>
          {!isLoadingShippingCategories && (
            <Spacer top='6' bottom='4'>
              <ShippingCategorySelect options={shippingCategories} />
            </Spacer>
          )}
          <Spacer top='6' bottom='12'>
            <Grid columns='auto' alignItems='end'>
              <HookedInput name='weight' label='Weight' />
              <HookedInputSelect
                name='unitOfWeight'
                initialValues={unitsOfWeightForSelect.map(
                  ({ value, label }) => ({
                    value,
                    label
                  })
                )}
                pathToValue='value'
              />
            </Grid>
            <Spacer top='2'>
              <Text variant='info' size='small'>
                Used to automatically calculate shipping weight.
              </Text>
            </Spacer>
          </Spacer>
        </Section>

        <Section title='Additional info'>
          <Spacer top='6' bottom='4'>
            <HookedInput
              type='number'
              name='piecesPerPack'
              label='Pieces per pack'
              hint={{
                text: (
                  <Text variant='info'>
                    Manage items with higher quantities per pack.
                  </Text>
                )
              }}
            />
          </Spacer>
          <Spacer top='6' bottom='12'>
            <HookedInput
              name='hsTariffNumber'
              label='HS Code'
              hint={{
                text: (
                  <Text variant='info'>
                    Used by customs authorities to identify products.
                  </Text>
                )
              }}
            />
          </Spacer>
        </Section>

        <Section title='Options'>
          <Spacer top='4' bottom='4'>
            <Text variant='info' size='small'>
              Manage different scenarios, such as digital products with no
              shipments, or products with virtually unlimited stock.
            </Text>
          </Spacer>
          <Spacer top='6' bottom='2'>
            <HookedInputCheckbox name='doNotShip'>
              <Text weight='semibold' size='small'>
                Do not ship
              </Text>
            </HookedInputCheckbox>
          </Spacer>
          <Spacer top='2' bottom='12'>
            <HookedInputCheckbox name='doNotTrack'>
              <Text weight='semibold' size='small'>
                Do not track stock
              </Text>
            </HookedInputCheckbox>
          </Spacer>
        </Section>

        <Spacer top='14'>
          <Button
            type='submit'
            disabled={isSubmitting || isLoadingShippingCategories}
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
            skuFormMethods.setValue('imageUrl', values.imageUrl)
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
                  name='imageUrl'
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
                    imageFormMethods.setValue('imageUrl', '')
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
