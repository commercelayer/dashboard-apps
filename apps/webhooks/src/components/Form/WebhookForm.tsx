import {
  Button,
  HookedForm,
  HookedInput,
  HookedValidationApiError,
  Spacer,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import type { Webhook } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation } from "wouter"
import zod from "zod"
import { EventSelector } from "#components/Form/EventSelector"
import { appRoutes } from "#data/routes"

const includeResourcesRegExp = /^[a-z][a-z_.]*[a-z](,[a-z][a-z_.]*[a-z])*$|^$/

const webhookFormSchema = zod
  .object({
    name: zod.string().min(1, { message: `Name can't be blank` }),
    topic: zod.string().min(1, { message: `Topic can't be blank` }),
    callback_url: zod
      .string()
      .min(1, { message: `Callback URL can't be blank` })
      .url({ message: "Callback URL is invalid" }),
    include_resources: zod.string().regex(includeResourcesRegExp, {
      message: "Include is invalid",
    }),
  })
  .required()

type WebhookFormValues = zod.infer<typeof webhookFormSchema>

interface Props {
  webhookData?: Webhook
}

const WebhookForm = ({ webhookData }: Props): React.JSX.Element | null => {
  const { sdkClient } = useCoreSdkProvider()
  const [apiError, setApiError] = useState<any>()
  const [, setLocation] = useLocation()

  const formAction = webhookData !== undefined ? "update" : "create"

  const includeResourcesValue =
    webhookData?.include_resources != null
      ? webhookData?.include_resources.join(",")
      : ""

  const defaultValues = {
    name: webhookData?.name ?? "",
    topic: webhookData?.topic ?? "",
    callback_url: webhookData?.callback_url ?? "",
    include_resources: includeResourcesValue,
  }

  const methods = useForm<WebhookFormValues>({
    defaultValues,
    resolver: zodResolver(webhookFormSchema),
  })

  if (sdkClient == null) {
    return null
  }

  const submitWebhookTask = async (
    values: WebhookFormValues,
  ): Promise<void> => {
    setApiError(undefined)

    try {
      const payload = {
        id: webhookData?.id ?? "",
        name: values.name,
        topic: values.topic,
        callback_url: values.callback_url,
        include_resources:
          values.include_resources === ""
            ? []
            : values.include_resources.split(","),
      }
      const sdkRequest = await sdkClient.webhooks[formAction](payload)
      methods.reset()
      setLocation(appRoutes.details.makePath({ webhookId: sdkRequest?.id }))
    } catch (error) {
      setApiError(error)
    }
  }

  return (
    <HookedForm
      {...methods}
      onSubmit={(values) => {
        void submitWebhookTask(values)
      }}
    >
      <Spacer bottom="6">
        <HookedInput
          label="Name"
          name="name"
          hint={{
            text: "Choose a meaningful name that helps you identify this webhook.",
          }}
        />
      </Spacer>

      <Spacer bottom="6">
        <EventSelector
          name="topic"
          hintText={
            <>
              The resource/event that will trigger the webhook.{" "}
              <a
                href="https://docs.commercelayer.io/core/real-time-webhooks#supported-events"
                target="blank"
              >
                Browse supported events
              </a>
              .
            </>
          }
        />
      </Spacer>

      <Spacer bottom="6">
        <HookedInput
          label="Callback URL"
          name="callback_url"
          hint={{ text: "The URL invoked by the webhook." }}
        />
      </Spacer>

      <Spacer bottom="12">
        <HookedInput
          label="Include"
          name="include_resources"
          hint={{
            text: "Comma separated resource names that should be included in the request body.",
          }}
        />
      </Spacer>

      <Spacer bottom="14">
        <Button variant="primary" type="submit" fullWidth>
          {formAction === "create" ? "Create webhook" : "Edit webhook"}
        </Button>
        <Spacer top="2">
          <HookedValidationApiError apiError={apiError} />
        </Spacer>
      </Spacer>
    </HookedForm>
  )
}

export default WebhookForm
