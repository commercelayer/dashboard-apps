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
  Text
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, type FC } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

interface CouponGeneratorModalProps {
  show: boolean
  handleClose: () => void
}

export const CouponGeneratorModal: FC<CouponGeneratorModalProps> = ({
  show,
  handleClose
}) => {
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

  return (
    <Modal show={show} onClose={handleClose} size='small'>
      <Modal.Header>Multiple coupons</Modal.Header>
      <Modal.Body>
        <HookedForm
          {...methods}
          onSubmit={(values) => {
            console.log('values', values)
            const generatedCodes = generateUniqueCoupons({
              numberOfCoupons: values.numberOfCoupons,
              codeLength: values.codeLength,
              case: values.case,
              prefix: values.prefix
            })
            console.log('generatedCodes', generatedCodes)
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
            <HookedInputCheckbox name='usageLimit'>
              Limit usage
            </HookedInputCheckbox>
          </Spacer>
          <Spacer bottom='12'>
            <HookedInputCheckbox name='customerSingleUse'>
              Single use per customer
            </HookedInputCheckbox>
          </Spacer>

          <Button type='submit' fullWidth>
            Generate coupons
          </Button>
        </HookedForm>
      </Modal.Body>
    </Modal>
  )
}

const formValidationSchema = z.object({
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
  // hasExpiration: z.boolean().default(false),
  expiresAt: z
    .date()
    .transform((date) => date.toISOString())
    .optional(),
  usageLimit: z.boolean().default(false),
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
