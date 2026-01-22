import type { Promotion } from '#types'
import {
  Button,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputCheckbox,
  HookedInputDate,
  HookedInputSelect,
  Label,
  Modal,
  Spacer,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo, useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

interface CouponGeneratorModalProps {
  promotion: Promotion
  show: boolean
  handleClose: () => void
  onImportCreated: (importId: string) => void
}

export const CouponGeneratorModal: FC<CouponGeneratorModalProps> = ({
  promotion,
  show,
  handleClose,
  onImportCreated
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { sdkClient } = useCoreSdkProvider()
  const methods = useForm<CouponGeneratorFormSchema>({
    defaultValues: {
      numberOfCoupons: 1000,
      codeLength: 8,
      case: 'mixed',
      prefix: ''
    },
    resolver: zodResolver(formValidationSchema)
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
        if (!isGenerating) {
          handleClose()
        }
      }}
      size='small'
    >
      <Modal.Header>Multiple coupons</Modal.Header>
      <Modal.Body>
        <HookedForm
          {...methods}
          onSubmit={async (values) => {
            setIsGenerating(true)
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
                expiresAt: values.expiresAt ?? undefined
              })

              console.log('Generated CSV Content:\n', csvContent)

              const couponImport = await sdkClient.imports.create({
                format: 'csv',
                inputs: csvContent as unknown as object[],
                resource_type: 'coupons',
                reference: `promotion_id:${promotion.id}`
              })

              onImportCreated(couponImport.id)
              handleClose()
              setIsGenerating(false)
            } catch (error) {
              console.error('Error generating coupons:', error)
              setIsGenerating(false)
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
            <Spacer bottom='2'>
              <Grid columns='2'>
                <HookedInputSelect
                  name='codeLength'
                  initialValues={[
                    { label: '6 characters', value: 6 },
                    { label: '8 characters', value: 8 },
                    { label: '10 characters', value: 10 }
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
              </Grid>
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

          <Button type='submit' fullWidth disabled={isGenerating}>
            {isGenerating ? 'Generating…' : 'Generate coupons'}
          </Button>
        </HookedForm>
      </Modal.Body>
    </Modal>
  )
}

const formValidationSchema = z.object({
  // coupon generation rules
  numberOfCoupons: z
    .number()
    .min(2, 'At least 2 coupon must be generated')
    .max(5000, 'A maximum of 5000 coupons can be generated at once'),
  codeLength: z
    .number()
    .min(6, 'Code length must be at least 4 characters')
    .max(10, 'Code length cannot exceed 20 characters'),
  case: z.enum(['upper', 'lower', 'mixed']),
  prefix: z
    .string()
    .max(4, 'Prefix cannot exceed 4 characters')
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

type CouponGeneratorFormSchema = z.infer<typeof formValidationSchema>

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
