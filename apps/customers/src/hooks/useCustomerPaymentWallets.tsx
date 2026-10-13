import { isMockedId, useCoreSdkProvider } from "@commercelayer/app-elements"
import type { PaymentWallet } from "@commercelayer/sdk"
import useSWR from "swr"

/**
 * Every payment wallet of the customer that is not canceled, newest first,
 * read page by page. Fetched apart from the customer: if the token cannot read
 * wallets, only this list is missing.
 */
export function useCustomerPaymentWallets(customerId: string): {
  paymentWallets: PaymentWallet[]
  mutatePaymentWallets: () => void
} {
  const { sdkClient } = useCoreSdkProvider()

  const { data, mutate } = useSWR(
    isMockedId(customerId) ? null : ["customer_payment_wallets", customerId],
    async () => {
      const paymentWallets: PaymentWallet[] = []
      let pageNumber = 1
      let pageCount = 1

      do {
        const page = await sdkClient.payment_wallets.list({
          filters: { customer_id_eq: customerId, status_not_eq: "canceled" },
          include: ["payment_setting"],
          sort: { created_at: "desc" },
          pageSize: 25,
          pageNumber,
        })
        paymentWallets.push(...page)
        pageCount = page.meta.pageCount
        pageNumber++
      } while (pageNumber <= pageCount)

      return paymentWallets
    },
    { shouldRetryOnError: false },
  )

  return {
    paymentWallets: data ?? [],
    mutatePaymentWallets: () => {
      void mutate()
    },
  }
}
