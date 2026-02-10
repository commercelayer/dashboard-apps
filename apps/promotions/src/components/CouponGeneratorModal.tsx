import type { Promotion } from '#types'
import {
  A,
  Button,
  HookedForm,
  HookedInput,
  HookedInputCheckbox,
  HookedInputDate,
  HookedInputSelect,
  Icon,
  Label,
  Modal,
  RadialProgress,
  Spacer,
  StatusIcon,
  Text,
  toast,
  useCoreApi,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { CommerceLayerStatic, type Import } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo, useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

interface CouponGeneratorModalProps {
  promotion: Promotion
  show: boolean
  onClose: (shouldReloadList?: boolean) => void
  currentImportJob: Import | null
}

export const CouponGeneratorModal: FC<CouponGeneratorModalProps> = ({
  promotion,
  show,
  onClose,
  currentImportJob
}) => {
  const { data: organization } = useCoreApi('organization', 'retrieve', [])
  const [isGeneratingCsv, setIsGeneratingCsv] = useState(false)
  const [isDeletingImport, setIsDeletingImport] = useState(false)
  const { sdkClient } = useCoreSdkProvider()
  const [importId, setImportId] = useState<string | undefined>(
    currentImportJob?.id
  )

  const { data: importJob } = useCoreApi(
    'imports',
    'retrieve',
    importId == null ? null : [importId],
    {
      refreshInterval: (job) =>
        (importId != null || currentImportJob != null) &&
        job?.status !== 'completed'
          ? 1000
          : 0,
      fallbackData: currentImportJob ?? undefined
    }
  )

  const isImportInProgress = importId != null || importJob != null
  const isImportCompleted = importJob?.status === 'completed'
  const importedCsvFile = importJob?.attachment_url
  const minCodeLength = organization?.coupons_min_code_length ?? 8
  const maxCodeLength = organization?.coupons_max_code_length ?? 40
  const prefixMaxLength = 25

  const methods = useForm<CouponGeneratorFormSchema>({
    defaultValues: {
      numberOfCoupons: 1000,
      codeLength: minCodeLength,
      case: 'mixed',
      prefix: ''
    },
    resolver: zodResolver(
      makeFormValidationSchema({
        minCodeLength,
        maxCodeLength,
        prefixMaxLength
      })
    )
  })

  const codeLength = methods.watch('codeLength')
  const codeCase = methods.watch('case')
  const prefix = methods.watch('prefix')
  const codeSample = useMemo(
    () =>
      generateUniqueCoupons({
        numberOfCoupons: 1,
        codeLength,
        case: codeCase,
        prefix
      })[0],
    [codeLength, codeCase, prefix]
  )

  const getPromotionRuleId = useCallback(async () => {
    let { id } = promotion?.coupon_codes_promotion_rule ?? {}
    if (id == null) {
      ;({ id } = await sdkClient.coupon_codes_promotion_rules.create({
        promotion: {
          id: promotion.id,
          type: promotion.type
        }
      }))
    }
    return id
  }, [promotion.id, sdkClient])

  return (
    <Modal
      show={show}
      onClose={() => {
        if (!isGeneratingCsv) {
          onClose()
        }
      }}
      size={isImportCompleted || isImportInProgress ? 'x-small' : 'small'}
    >
      {isImportCompleted ? (
        <>
          <Modal.Body>
            <Spacer top='4' bottom='4'>
              <StatusIcon
                name='check'
                background='green'
                gap='large'
                align='center'
              />
            </Spacer>
            <Text weight='semibold' align='center' tag='div'>
              Your coupons are ready.
            </Text>
            <Spacer top='1'>
              <Text align='center' tag='div' size='small' variant='info'>
                Download now or find them in Imports.
              </Text>
            </Spacer>
          </Modal.Body>
          <Modal.Footer>
            {importedCsvFile != null && (
              <A
                href={importedCsvFile}
                variant='primary'
                onClick={() => {
                  onClose(true)
                  setIsGeneratingCsv(false)
                  setImportId(undefined)
                }}
                fullWidth
                alignItems='center'
              >
                <Icon name='fileArrowDown' />
                Download (CSV)
              </A>
            )}
            <Button
              type='button'
              variant='secondary'
              fullWidth
              onClick={() => {
                onClose(true)
                setIsGeneratingCsv(false)
                setImportId(undefined)
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </>
      ) : isImportInProgress ? (
        <>
          <Modal.Body>
            <Spacer top='4' bottom='6'>
              <RadialProgress
                percentage={
                  importJob == null ? 0 : getProgressPercentage(importJob).value
                }
                align='center'
              />
            </Spacer>
            <Text weight='semibold' align='center' tag='div'>
              Generating coupons…
            </Text>
            <Spacer top='1'>
              <Text align='center' tag='div' size='small' variant='info'>
                This may take a few moments.
              </Text>
            </Spacer>
          </Modal.Body>
          {importJob?.status === 'pending' ? (
            <Modal.Footer>
              <Button
                type='button'
                variant='secondary'
                fullWidth
                disabled={isDeletingImport}
                onClick={() => {
                  if (importId == null) return
                  setIsDeletingImport(true)
                  void sdkClient.imports
                    .delete(importId)
                    .then(() => {
                      onClose(true)
                      setImportId(undefined)
                    })
                    .catch(() => {
                      toast('Could not cancel the import')
                    })
                    .finally(() => {
                      setIsDeletingImport(false)
                    })
                }}
              >
                Cancel generation
              </Button>
            </Modal.Footer>
          ) : (
            <div style={{ paddingTop: '1rem' }} />
          )}
        </>
      ) : (
        // FORM TO GENERATE COUPONS
        <>
          <Modal.Header>Multiple coupons</Modal.Header>
          <Modal.Body>
            <HookedForm
              {...methods}
              onSubmit={async (values) => {
                setIsGeneratingCsv(true)
                try {
                  const generatedCodes = generateUniqueCoupons({
                    numberOfCoupons: values.numberOfCoupons,
                    codeLength: values.codeLength,
                    case: values.case,
                    prefix: values.prefix
                  })

                  const promotionRuleId = await getPromotionRuleId()

                  const csvContent = makeCsv({
                    codes: generatedCodes,
                    promotionRuleId,
                    usageLimit: values.usageLimit ?? undefined,
                    expiresAt: values.expiresAt ?? undefined,
                    customerSingleUse: values.customerSingleUse || undefined
                  })

                  const couponImport = await sdkClient.imports.create({
                    format: 'csv',
                    inputs: csvContent as unknown as object[],
                    resource_type: 'coupons',
                    reference: `promotion_id:${promotion.id}`
                  })
                  setImportId(couponImport.id)
                  setIsGeneratingCsv(false)
                } catch (error) {
                  setIsGeneratingCsv(false)
                  const apiError = CommerceLayerStatic.isApiError(error)
                    ? error
                    : null
                  const errorMessage =
                    apiError?.errors?.map((e: any) => e.detail).join(', ') ??
                    'An error occurred while generating coupons'
                  toast(errorMessage, {
                    type: 'error'
                  })
                }
              }}
            >
              <Spacer bottom='8'>
                <HookedInput
                  type='number'
                  name='numberOfCoupons'
                  label='Number'
                  suffix='codes'
                />
              </Spacer>
              <Spacer bottom='8'>
                <Label>Format</Label>
                <Spacer top='2' bottom='2'>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px'
                    }}
                  >
                    <HookedInputSelect
                      name='codeLength'
                      initialValues={[
                        {
                          label: `${minCodeLength} characters`,
                          value: minCodeLength
                        },
                        { label: '10 characters', value: 10 },
                        { label: '12 characters', value: 12 }
                      ]}
                    />
                    <HookedInputSelect
                      name='case'
                      initialValues={[
                        { label: 'Uppercase', value: 'upper' },
                        { label: 'Lowercase', value: 'lower' },
                        { label: 'Mixed', value: 'mixed' }
                      ]}
                    />
                  </div>
                </Spacer>
                <Spacer bottom='2'>
                  <HookedInput name='prefix' placeholder='Prefix (optional)' />
                </Spacer>
                <div
                  style={{
                    padding: '10px',
                    fontSize: 13,
                    backgroundColor: '#F8F8F8',
                    borderRadius: 5,
                    textAlign: 'center'
                  }}
                >
                  <Text color='info'>
                    Preview: <Text weight='semibold'>{codeSample}</Text>
                  </Text>
                </div>
              </Spacer>

              <Spacer bottom='2'>
                <HookedInputCheckbox
                  name='hasExpiration'
                  checkedElement={
                    <HookedInputDate
                      name='expiresAt'
                      placeholder='Expiration date'
                      minDate={new Date()}
                      showTimeSelect
                    />
                  }
                >
                  Set expiration date
                </HookedInputCheckbox>
              </Spacer>
              <Spacer bottom='2'>
                <HookedInputCheckbox
                  name='hasUsageLimit'
                  checkedElement={
                    <HookedInput
                      name='usageLimit'
                      placeholder='max usage'
                      type='number'
                      min={0}
                      step={1}
                    />
                  }
                >
                  Limit usage
                </HookedInputCheckbox>
              </Spacer>
              <Spacer bottom='12'>
                <HookedInputCheckbox name='customerSingleUse'>
                  Single use per customer
                </HookedInputCheckbox>
              </Spacer>

              <Button type='submit' fullWidth disabled={isGeneratingCsv}>
                {isGeneratingCsv ? 'Generating…' : 'Generate coupons'}
              </Button>
            </HookedForm>
          </Modal.Body>
        </>
      )}
    </Modal>
  )
}

const makeFormValidationSchema = ({
  minCodeLength,
  maxCodeLength,
  prefixMaxLength
}: {
  minCodeLength: number
  maxCodeLength: number
  prefixMaxLength: number
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) =>
  z.object({
    // coupon generation rules
    numberOfCoupons: z
      .number()
      .min(2, 'At least 2 coupon must be generated')
      .max(5000, 'You can generate up to 5,000 coupons at once'),
    codeLength: z
      .number()
      .min(
        minCodeLength,
        `Code length must be at least ${minCodeLength} characters`
      )
      .max(
        maxCodeLength,
        `Code length cannot exceed ${maxCodeLength} characters`
      ),
    case: z.enum(['upper', 'lower', 'mixed']),
    prefix: z
      .string()
      .max(
        prefixMaxLength,
        `Prefix cannot exceed ${prefixMaxLength} characters`
      )
      .optional()
      .nullable(),

    // options
    expiresAt: z
      .date()
      .transform((date) => date.toISOString())
      .optional(),
    usageLimit: z
      .number()
      .min(1, 'Usage limit must be at least 1')
      .optional()
      .nullable(),
    customerSingleUse: z.boolean().default(false)
  })

type CouponGeneratorFormSchema = z.infer<
  ReturnType<typeof makeFormValidationSchema>
>

interface CouponGeneratorParams {
  numberOfCoupons: number
  codeLength: number
  case: 'upper' | 'lower' | 'mixed'
  prefix?: string | null
}

function generateUniqueCoupons(params: CouponGeneratorParams): string[] {
  const { numberOfCoupons, codeLength, case: caseType, prefix } = params

  // Character sets - numbers are always included
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'

  let charset = numbers
  if (caseType === 'upper') {
    charset += uppercase
  } else if (caseType === 'lower') {
    charset += lowercase
  } else {
    charset += uppercase + lowercase
  }

  const coupons = new Set<string>()
  const prefixStr = prefix ?? ''

  while (coupons.size < numberOfCoupons) {
    const randomValues = new Uint32Array(codeLength)
    crypto.getRandomValues(randomValues)

    let code = prefixStr
    for (let i = 0; i < codeLength; i++) {
      const randomValue = randomValues[i] ?? 0
      code += charset[randomValue % charset.length]
    }

    coupons.add(code)
  }

  return Array.from(coupons)
}

function makeCsv({
  codes,
  promotionRuleId,
  expiresAt,
  usageLimit,
  customerSingleUse
}: {
  codes: string[]
  promotionRuleId?: string
  expiresAt?: string
  usageLimit?: number
  customerSingleUse?: boolean
}): string {
  const header =
    'code,promotion_rule_id,expires_at,usage_limit,customer_single_use\n'
  const rows = codes
    .map(
      (code) =>
        `${code},${promotionRuleId ?? ''},${expiresAt ?? ''},${usageLimit ?? ''},${customerSingleUse ?? ''}\n`
    )
    .join('')
  return header + rows
}

function getProgressPercentage(importJob: Import): {
  value: number
  formatted: string
} {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { processed_count, inputs_size } = importJob
  if (
    processed_count != null &&
    processed_count > 0 &&
    inputs_size != null &&
    inputs_size > 0
  ) {
    const value = Math.floor((processed_count * 100) / inputs_size)
    return value > 100
      ? {
          value: 100,
          formatted: '100%'
        }
      : {
          value,
          formatted: `${value}%`
        }
  }

  return {
    value: 0,
    formatted: '0%'
  }
}
