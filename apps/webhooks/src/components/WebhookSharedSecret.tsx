import {
  CodeBlock,
  Section,
  Spacer,
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
      {/* `Section` puts no space under its divider: fine for content that brings
          its own padding, but a `CodeBlock` is flat and would sit on the line */}
      <Spacer top="4">
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
      </Spacer>
    </Section>
  ),
)
