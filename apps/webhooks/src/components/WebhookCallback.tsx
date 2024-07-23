import {
  InputReadonly,
  Section,
  Spacer,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Webhook } from '@commercelayer/sdk'

interface WebhookCallbackProps {
  webhook: Webhook
}

export const WebhookCallback = withSkeletonTemplate<WebhookCallbackProps>(
  ({ webhook }) => {
    return (
      <Section title='Callback'>
        <Spacer top='6' bottom='10'>
          <InputReadonly
            label='Callback URL'
            value={webhook.callback_url}
            showCopyAction
          />
        </Spacer>
        <Spacer bottom='12'>
          <InputReadonly
            label='Shared secret'
            value={webhook.shared_secret}
            showCopyAction
            hint={{
              text: (
                <>
                  Used to verify the{' '}
                  <a
                    href='https://docs.commercelayer.io/core/callbacks-security'
                    target='_blank'
                    rel='noreferrer'
                  >
                    callback authenticity
                  </a>
                  .
                </>
              )
            }}
          />
        </Spacer>
      </Section>
    )
  }
)
