import type { ApiError } from "App"
import { CommerceLayerStatic } from "@commercelayer/sdk"

export function parseApiError(err: any): ApiError[] {
  if (CommerceLayerStatic.isApiError(err) && Array.isArray(err.errors)) {
    console.error(err.errors)
    return err.errors
  } else {
    return [
      {
        title: err.message ?? "Could not save the webhook",
        detail: err.message ?? "Could not save the webhook",
      },
    ]
  }
}
