import {
  CodeBlock,
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
          <CodeBlock label='Callback URL' showCopyAction>
            {webhook.callback_url}
          </CodeBlock>
        </Spacer>
        <Spacer bottom='12'>
          <CodeBlock
            label='Shared secret'
            showCopyAction
            showSecretAction
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
          >
            {webhook.shared_secret}
          </CodeBlock>
        </Spacer>
      </Section>
    )
  }
)
