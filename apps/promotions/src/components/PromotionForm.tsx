import { formValuesToPromotion } from '#data/formConverters/promotion'
import {
  appPromotionsReferenceOrigin,
  type PromotionType,
  type promotionConfig
} from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import { type Promotion } from '#types'
import {
  Button,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputCheckbox,
  HookedInputDate,
  Section,
  Spacer,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { type z } from 'zod'

interface Props {
  promotionConfig: (typeof promotionConfig)[keyof typeof promotionConfig]
  promotionId?: string
  defaultValues?: Partial<
    z.infer<(typeof promotionConfig)[PromotionType]['formType']>
  >
}

export function PromotionForm({
  promotionConfig,
  defaultValues,
  promotionId
}: Props): React.ReactNode {
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const { promotion } = usePromotion(promotionId)
  const methods = useForm<z.infer<typeof promotionConfig.formType>>({
    defaultValues,
    resolver: zodResolver(promotionConfig.formType)
  })

  const isCreatingNewPromotion = promotionId == null

  useEffect(
    function updateFormWithNewDefaultValues() {
      if (defaultValues != null) {
        methods.reset(defaultValues)
      }
    },
    [defaultValues?.name]
  )

  return (
    <HookedForm
      {...methods}
      onSubmit={async (formValues): Promise<void> => {
        const resource = sdkClient[promotionConfig.type]
        let promotion: Promotion

        if (isCreatingNewPromotion) {
          // @ts-expect-error // TODO: I need to fix this
          promotion = await resource.create({
            ...formValuesToPromotion(formValues),
            _disable: true,
            reference_origin: appPromotionsReferenceOrigin
          })
        } else {
          // @ts-expect-error // TODO: I need to fix thi
          promotion = await resource.update({
            id: promotionId,
            ...formValuesToPromotion(formValues)
          })
        }

        setLocation(
          appRoutes.promotionDetails.makePath({
            promotionId: promotion.id
          })
        )
      }}
    >
      <Spacer top='14'>
        <Section title='Basic info'>
          <Spacer top='6'>
            <HookedInput
              name='name'
              label='Promotion name *'
              hint={{ text: 'Pick a name that helps you identify it.' }}
            />
          </Spacer>
          <Spacer top='6'>
            <Grid columns='2'>
              <HookedInputDate
                showTimeSelect
                name='starts_at'
                label='Starts on *'
                hint={{ text: 'The date the promotion will start.' }}
              />
              <HookedInputDate
                showTimeSelect
                name='expires_at'
                label='Expires on *'
                hint={{ text: 'The date the promotion will end.' }}
              />
            </Grid>
          </Spacer>

          <promotionConfig.Fields promotion={promotion} />

          <Spacer top='6'>
            <HookedInput
              type='number'
              min={1}
              name='total_usage_limit'
              label='Usage limit'
              hint={{
                text: 'Optionally limit how many times this promotion can be used.'
              }}
            />
          </Spacer>

          <Spacer top='6'>
            <HookedInput name='reference' label='Reference' />
          </Spacer>
        </Section>
      </Spacer>

      <promotionConfig.Options promotion={promotion} />

      <Spacer top='14'>
        <Section title='How this promotion works with concurrent ones'>
          <Spacer top='6'>
            <Spacer top='2'>
              <HookedInputCheckbox name='exclusive'>
                <Text weight='semibold'>
                  Make it exclusive (the other promotions won't apply)
                </Text>
              </HookedInputCheckbox>
            </Spacer>

            <Spacer top='2'>
              <HookedInputCheckbox
                name='show_priority'
                checkedElement={
                  <Spacer bottom='6'>
                    <HookedInput
                      type='number'
                      min={1}
                      name='priority'
                      suffix='index'
                      hint={{
                        text: (
                          <div>
                            Lower index means higher priority, overriding the{' '}
                            <a
                              target='_blank'
                              href='https://docs.commercelayer.io/core/v/api-reference/promotions#priority-and-order-of-application'
                              rel='noreferrer'
                            >
                              default priority
                            </a>
                            .
                          </div>
                        )
                      }}
                    />
                  </Spacer>
                }
              >
                <Text weight='semibold'>Assign a priority</Text>
              </HookedInputCheckbox>
            </Spacer>
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
            {promotionId != null ? 'Update' : 'Create promotion'}
          </Button>
        </Spacer>
      </Spacer>
    </HookedForm>
  )
}
