import { AvatarLetter, RadialProgress } from "@commercelayer/app-elements"
import type { Customer } from "@commercelayer/sdk"
import type { FC } from "react"

/**
 * Avatar of a customer: initials for a registered one (the colour is derived
 * from the email, so it is stable), and the dashed pending circle for a guest,
 * who has no account to speak of. Both are 36px, so registered and guest rows
 * line up.
 */
export const CustomerAvatar: FC<{
  customer: Pick<Customer, "email" | "has_password">
}> = ({ customer }) =>
  customer.has_password === true ? (
    <AvatarLetter text={customer.email} size="medium" />
  ) : (
    // no `percentage`, so it renders as the dashed circle
    <RadialProgress icon="user" size="medium" />
  )
