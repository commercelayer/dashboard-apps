import { OrderLineItems } from '#components/OrderSummary/OrderLineItems'
import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Button,
  EmptyState,
  HookedForm,
  HookedInputCheckbox,
  HookedInputSelect,
  HookedValidationApiError,
  PageLayout,
  Section,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { z } from 'zod'
import { SelectCustomerComponent } from './SelectCustomerComponent'

export const EditOrderStep: React.FC<
  Pick<PageProps<typeof appRoutes.new>, 'overlay'> & {
    orderId: string
  }
> = ({ overlay, orderId }) => {
  const [, setLocation] = useLocation()
  const [apiError, setApiError] = useState<any>()
  const { sdkClient } = useCoreSdkProvider()

  const { order, isLoading } = useOrderDetails(orderId)

  const methods = useForm<z.infer<typeof orderSchema>>({
    defaultValues: {
      language_code: 'en',
      at_least_one_sku: order.skus_count != null && order.skus_count > 0
    },
    resolver: zodResolver(orderSchema)
  })

  useEffect(() => {
    methods.setValue(
      'at_least_one_sku',
      order?.skus_count != null && order.skus_count > 0,
      { shouldValidate: methods.formState.isSubmitted }
    )

    if (order?.customer_email != null) {
      methods.resetField('customer_email', {
        defaultValue: order.customer_email
      })
    }
  }, [methods, order])

  if (order.status !== 'draft' && order.status !== 'pending') {
    return (
      <PageLayout
        title=''
        overlay={overlay}
        gap='only-top'
        navigationButton={{
          label: 'Close',
          icon: 'x',
          onClick() {
            setLocation(appRoutes.home.makePath({}))
          }
        }}
      >
        <EmptyState
          title='Not found'
          description='We could not find the resource you are looking for.'
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <span>
          <SkeletonTemplate isLoading={isLoading}>
            New order {order.market?.name}
          </SkeletonTemplate>
        </span>
      }
      overlay={overlay}
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='14'>
          <OrderLineItems title='Cart' order={order} />
        </Spacer>

        <HookedForm
          {...methods}
          onSubmit={async (formValues) => {
            if (order.skus_count === 0) {
              setApiError({
                errors: [
                  {
                    code: 42,
                    title:
                      'Cannot create the order without a valid SKU. Please select one.',
                    detail:
                      'Cannot create the order without a valid SKU. Please select one.'
                  }
                ]
              })
            } else {
              // All good!
              void sdkClient.orders
                .update({
                  id: order.id,
                  customer_email: formValues.customer_email,
                  language_code: formValues.language_code
                })
                .then(() => {
                  setLocation(
                    appRoutes.details.makePath({
                      orderId: order.id
                    })
                  )
                })
            }
          }}
        >
          <HookedInputCheckbox
            name='at_least_one_sku'
            style={{ display: 'none' }}
          />

          <Spacer top='14'>
            <Section title='Customer'>
              <Spacer top='6'>
                <SelectCustomerComponent />
              </Spacer>

              <Spacer top='6'>
                <HookedInputSelect
                  name='language_code'
                  label='Language *'
                  initialValues={availableLanguages}
                  hint={{ text: 'The language used for checkout.' }}
                />
              </Spacer>
            </Section>
          </Spacer>

          <Spacer top='14'>
            <Spacer top='8'>
              <Button
                type='submit'
                fullWidth
                disabled={methods.formState.isSubmitting}
              >
                Create order
              </Button>
              <Spacer top='2'>
                <HookedValidationApiError apiError={apiError} />
              </Spacer>
            </Spacer>
          </Spacer>
        </HookedForm>
      </SkeletonTemplate>
    </PageLayout>
  )
}

const availableLanguages: InputSelectValue[] = [
  { label: 'Afar', value: 'aa' },
  { label: 'Abkhazian', value: 'ab' },
  { label: 'Afrikaans', value: 'af' },
  { label: 'Amharic', value: 'am' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Assamese', value: 'as' },
  { label: 'Aymara', value: 'ay' },
  { label: 'Azerbaijani', value: 'az' },
  { label: 'Bashkir', value: 'ba' },
  { label: 'Byelorussian', value: 'be' },
  { label: 'Bulgarian', value: 'bg' },
  { label: 'Bihari', value: 'bh' },
  { label: 'Bislama', value: 'bi' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Tibetan', value: 'bo' },
  { label: 'Breton', value: 'br' },
  { label: 'Catalan', value: 'ca' },
  { label: 'Corsican', value: 'co' },
  { label: 'Czech', value: 'cs' },
  { label: 'Welsh', value: 'cy' },
  { label: 'Danish', value: 'da' },
  { label: 'German', value: 'de' },
  { label: 'Bhutani', value: 'dz' },
  { label: 'Greek', value: 'el' },
  { label: 'English', value: 'en' },
  { label: 'Esperanto', value: 'eo' },
  { label: 'Spanish', value: 'es' },
  { label: 'Estonian', value: 'et' },
  { label: 'Basque', value: 'eu' },
  { label: 'Persian', value: 'fa' },
  { label: 'Finnish', value: 'fi' },
  { label: 'Fiji', value: 'fj' },
  { label: 'Faeroese', value: 'fo' },
  { label: 'French', value: 'fr' },
  { label: 'Frisian', value: 'fy' },
  { label: 'Irish', value: 'ga' },
  { label: 'Scots Gaelic', value: 'gd' },
  { label: 'Galician', value: 'gl' },
  { label: 'Guarani', value: 'gn' },
  { label: 'Gujarati', value: 'gu' },
  { label: 'Hausa', value: 'ha' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Croatian', value: 'hr' },
  { label: 'Hungarian', value: 'hu' },
  { label: 'Armenian', value: 'hy' },
  { label: 'Interlingua', value: 'ia' },
  { label: 'Interlingue', value: 'ie' },
  { label: 'Inupiak', value: 'ik' },
  { label: 'Indonesian', value: 'in' },
  { label: 'Icelandic', value: 'is' },
  { label: 'Italian', value: 'it' },
  { label: 'Hebrew', value: 'iw' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Yiddish', value: 'ji' },
  { label: 'Javanese', value: 'jw' },
  { label: 'Georgian', value: 'ka' },
  { label: 'Kazakh', value: 'kk' },
  { label: 'Greenlandic', value: 'kl' },
  { label: 'Cambodian', value: 'km' },
  { label: 'Kannada', value: 'kn' },
  { label: 'Korean', value: 'ko' },
  { label: 'Kashmiri', value: 'ks' },
  { label: 'Kurdish', value: 'ku' },
  { label: 'Kirghiz', value: 'ky' },
  { label: 'Latin', value: 'la' },
  { label: 'Lingala', value: 'ln' },
  { label: 'Laothian', value: 'lo' },
  { label: 'Lithuanian', value: 'lt' },
  { label: 'Latvian', value: 'lv' },
  { label: 'Malagasy', value: 'mg' },
  { label: 'Maori', value: 'mi' },
  { label: 'Macedonian', value: 'mk' },
  { label: 'Malayalam', value: 'ml' },
  { label: 'Mongolian', value: 'mn' },
  { label: 'Moldavian', value: 'mo' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Malay', value: 'ms' },
  { label: 'Maltese', value: 'mt' },
  { label: 'Burmese', value: 'my' },
  { label: 'Nauru', value: 'na' },
  { label: 'Nepali', value: 'ne' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Norwegian', value: 'no' },
  { label: 'Occitan', value: 'oc' },
  { label: 'Oromo', value: 'om' },
  { label: 'Oriya', value: 'or' },
  { label: 'Punjabi', value: 'pa' },
  { label: 'Polish', value: 'pl' },
  { label: 'Pashto', value: 'ps' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Quechua', value: 'qu' },
  { label: 'Rhaeto-Romance', value: 'rm' },
  { label: 'Kirundi', value: 'rn' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Russian', value: 'ru' },
  { label: 'Kinyarwanda', value: 'rw' },
  { label: 'Sanskrit', value: 'sa' },
  { label: 'Sindhi', value: 'sd' },
  { label: 'Sangro', value: 'sg' },
  { label: 'Serbo-Croatian', value: 'sh' },
  { label: 'Singhalese', value: 'si' },
  { label: 'Slovak', value: 'sk' },
  { label: 'Slovenian', value: 'sl' },
  { label: 'Samoan', value: 'sm' },
  { label: 'Shona', value: 'sn' },
  { label: 'Somali', value: 'so' },
  { label: 'Albanian', value: 'sq' },
  { label: 'Serbian', value: 'sr' },
  { label: 'Siswati', value: 'ss' },
  { label: 'Sesotho', value: 'st' },
  { label: 'Sundanese', value: 'su' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Swahili', value: 'sw' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Tegulu', value: 'te' },
  { label: 'Tajik', value: 'tg' },
  { label: 'Thai', value: 'th' },
  { label: 'Tigrinya', value: 'ti' },
  { label: 'Turkmen', value: 'tk' },
  { label: 'Tagalog', value: 'tl' },
  { label: 'Setswana', value: 'tn' },
  { label: 'Tonga', value: 'to' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Tsonga', value: 'ts' },
  { label: 'Tatar', value: 'tt' },
  { label: 'Twi', value: 'tw' },
  { label: 'Ukrainian', value: 'uk' },
  { label: 'Urdu', value: 'ur' },
  { label: 'Uzbek', value: 'uz' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Volapuk', value: 'vo' },
  { label: 'Wolof', value: 'wo' },
  { label: 'Xhosa', value: 'xh' },
  { label: 'Yoruba', value: 'yo' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Zulu', value: 'zu' }
]

const orderSchema = z.object({
  at_least_one_sku: z
    .boolean()
    .refine(
      (value) => value,
      'Cannot create the order without a valid SKU. Please select at least one.'
    ),
  customer_email: z.string().email(),
  language_code: z
    .string()
    .refine(
      (value) => availableLanguages.map((l) => l.value).includes(value),
      'Invalid language'
    )
})
