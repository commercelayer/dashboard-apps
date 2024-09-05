import { isDefined } from '#data/isValid'
import {
  ruleBuilderConfig,
  type RuleBuilderConfig,
  type matchers
} from '#data/ruleBuilder/config'
import { ruleBuilderFormValidator } from '#data/ruleBuilder/form/validator'
import { usePromotionRules } from '#data/ruleBuilder/usePromotionRules'
import { type Promotion } from '#types'
import {
  Button,
  HookedForm,
  HookedInputSelect,
  Spacer,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { GroupedSelectValues } from '@commercelayer/app-elements/dist/ui/forms/InputSelect/InputSelect'
import type {
  CustomPromotionRule,
  FlexPromotion,
  SkuListPromotionRuleUpdate
} from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useCurrencyCodes } from '../currency'

export function RuleBuilderForm({
  promotion,
  onSuccess
}: {
  promotion: Exclude<Promotion, FlexPromotion>
  onSuccess: () => void
}): JSX.Element {
  const { inputParameter, methods, otherInputs, watchParameter } =
    useRuleBuilderFormFields(promotion)

  const { sdkClient } = useCoreSdkProvider()

  return (
    <HookedForm
      {...methods}
      onSubmit={async (values): Promise<void> => {
        if (values.parameter != null) {
          const config = ruleBuilderConfig[values.parameter]

          if (values.parameter === 'skuListPromotionRule') {
            const promotionRules = promotion.promotion_rules ?? []
            const skuListPromotionRule = promotionRules.find(
              (pr): pr is CustomPromotionRule =>
                pr.type === 'sku_list_promotion_rules'
            )
            const resourceAttributes: Pick<
              SkuListPromotionRuleUpdate,
              'all_skus' | 'min_quantity' | 'sku_list'
            > = {
              all_skus: values.all_skus === 'all',
              min_quantity: values.min_quantity,
              sku_list:
                typeof values.value === 'string'
                  ? {
                      type: 'sku_lists',
                      id: values.value
                    }
                  : null
            }
            if (skuListPromotionRule != null) {
              await sdkClient.sku_list_promotion_rules.update({
                id: skuListPromotionRule.id,
                ...resourceAttributes
              })
            } else {
              await sdkClient.sku_list_promotion_rules.create({
                promotion: { type: promotion.type, id: promotion.id },
                ...resourceAttributes
              })
            }
            onSuccess()
          } else {
            // CustomPromotionRule
            if (values.operator != null) {
              const promotionRules = promotion.promotion_rules ?? []

              if (config?.resource === 'custom_promotion_rules') {
                const customPromotionRule = promotionRules.find(
                  (pr): pr is CustomPromotionRule =>
                    pr.type === 'custom_promotion_rules'
                )

                const predicate = `${values.parameter}_${values.operator}`
                const newFilter = {
                  [predicate]: Array.isArray(values.value)
                    ? values.value?.join(',')
                    : values.value
                }

                if (customPromotionRule != null) {
                  await sdkClient.custom_promotion_rules.update({
                    id: customPromotionRule.id,
                    filters: {
                      ...customPromotionRule.filters,
                      ...newFilter
                    }
                  })
                } else {
                  await sdkClient.custom_promotion_rules.create({
                    promotion: { type: promotion.type, id: promotion.id },
                    filters: newFilter
                  })
                }

                onSuccess()
              }
            }
          }
        }
      }}
    >
      <Spacer top='4'>{inputParameter}</Spacer>
      {watchParameter != null && (
        <>
          {otherInputs.map(([key, input]) => (
            <Spacer top='4' key={key}>
              {input}
            </Spacer>
          ))}
        </>
      )}
      <Spacer top='14'>
        <Button
          fullWidth
          type='submit'
          disabled={
            // methods.formState.isSubmitting || !methods.formState.isValid
            methods.formState.isSubmitting
          }
        >
          Create
        </Button>
      </Spacer>
    </HookedForm>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useRuleBuilderFormFields(
  promotion: Exclude<Promotion, FlexPromotion>
) {
  const { rules } = usePromotionRules(promotion)
  const currencyCodes = useCurrencyCodes(promotion)

  const methods = useForm<{
    parameter: keyof RuleBuilderConfig | null
    operator: keyof typeof matchers | null
    value: string | number | string[] | null
    all_skus: 'any' | 'all' | 'number' | null
    min_quantity: number | null
  }>({
    defaultValues: {
      parameter: null,
      operator: null,
      value: null,
      all_skus: 'any'
    },
    resolver: zodResolver(ruleBuilderFormValidator)
  })

  const watchParameter = methods.watch('parameter')

  const parameterInitialValues = useMemo<
    GroupedSelectValues | InputSelectValue[]
  >(() => {
    const inputSelectValues = Object.entries(ruleBuilderConfig)
      .map(([value, { label, isAvailable }]): InputSelectValue | null => {
        const isAlreadySet =
          rules.find((rule) => rule.valid && rule.configKey === value) != null
        return !isAlreadySet
          ? {
              label,
              value,
              isDisabled: !isAvailable({ currencyCodes, rules })
            }
          : null
      })
      .filter(isDefined)

    const availableOptions = inputSelectValues.filter(
      (v) => v.isDisabled !== true
    )

    const notAvailableOptions = inputSelectValues.filter(
      (v) => v.isDisabled === true
    )

    return [
      {
        label: 'Applicable',
        options: availableOptions
      },
      {
        label: 'Not applicable: you must set a single currency',
        options: notAvailableOptions
      }
    ]
  }, [ruleBuilderConfig, currencyCodes, rules])

  const operatorInitialValues: InputSelectValue[] | null = useMemo(() => {
    if (watchParameter == null) {
      return []
    }

    return (ruleBuilderConfig[watchParameter]?.operators?.map(
      ({ label, value }) => ({
        label,
        value
      })
    ) ?? null) satisfies InputSelectValue[] | null
  }, [watchParameter])

  const inputComponent: React.ReactNode | null = useMemo(() => {
    if (watchParameter == null || ruleBuilderConfig[watchParameter] == null) {
      return null
    }

    const { Component } = ruleBuilderConfig[watchParameter]

    return <Component promotion={promotion} />
  }, [watchParameter, promotion])

  const inputOperator =
    operatorInitialValues != null ? (
      <HookedInputSelect
        isSearchable={false}
        initialValues={operatorInitialValues}
        name='operator'
      />
    ) : null

  useEffect(() => {
    methods.resetField('operator')
    methods.resetField('value')
  }, [watchParameter])

  return {
    methods,
    watchParameter,
    inputParameter: (
      <HookedInputSelect
        isSearchable={false}
        initialValues={parameterInitialValues}
        name='parameter'
      />
    ),
    otherInputs: [
      ['operator', inputOperator],
      ['component', inputComponent]
    ] as const
  }
}
