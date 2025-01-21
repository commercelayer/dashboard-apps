import {
  ListDetailsItem,
  Section,
  Text,
  formatDateWithPredicate,
  getCustomerStatusName,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  customer: Customer
}

export const CustomerInfo = withSkeletonTemplate<Props>(
  ({ customer }): JSX.Element => {
    const { user } = useTokenProvider()
    const { t } = useTranslation()

    return (
      <Section title={t('common.info')}>
        <ListDetailsItem label={t('apps.customers.details.type')} gutter='none'>
          <Text tag='div' weight='semibold'>
            {customer?.has_password === true
              ? t('apps.customers.details.registered')
              : t('apps.customers.details.guest')}
          </Text>
        </ListDetailsItem>
        <ListDetailsItem
          label={t('apps.customers.attributes.status')}
          gutter='none'
        >
          <Text tag='div' weight='semibold' className='capitalize'>
            {getCustomerStatusName(customer?.status)}
          </Text>
        </ListDetailsItem>
        <ListDetailsItem
          label={t('apps.customers.form.customer_group_label')}
          gutter='none'
        >
          <Text tag='div' weight='semibold'>
            {customer?.customer_group?.name ?? (
              <Text className='text-gray-300'>&#8212;</Text>
            )}
          </Text>
        </ListDetailsItem>
        {customer.customer_subscriptions != null &&
          customer.customer_subscriptions.length > 0 && (
            <ListDetailsItem
              label={t('apps.customers.details.newsletter')}
              gutter='none'
            >
              <Text tag='div' weight='semibold'>
                {formatDateWithPredicate({
                  predicate: t('apps.customers.details.subscribed'),
                  isoDate: customer.customer_subscriptions[0]?.created_at ?? '',
                  timezone: user?.timezone,
                  locale: user?.locale
                })}
              </Text>
            </ListDetailsItem>
          )}
      </Section>
    )
  }
)
