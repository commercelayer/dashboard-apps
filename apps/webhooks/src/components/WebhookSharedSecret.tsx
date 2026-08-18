import {
  CodeBlock,
  Section,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Webhook } from "@commercelayer/sdk"

interface Props {
  webhook: Webhook
}

/** The secret used to sign callbacks, masked until revealed. */
export const WebhookSharedSecret = withSkeletonTemplate<Props>(
  ({ webhook }) => (
    <Section title="Shared secret">
      <CodeBlock
        showCopyAction
        showSecretAction
        hint={{
          text: (
            <>
              Used to verify the{" "}
              <a
                href="https://docs.commercelayer.io/core/callbacks-security"
                target="_blank"
                rel="noreferrer"
              >
                callback authenticity
              </a>
              .
            </>
          ),
        }}
      >
        {webhook.shared_secret}
      </CodeBlock>
    </Section>
  ),
)
