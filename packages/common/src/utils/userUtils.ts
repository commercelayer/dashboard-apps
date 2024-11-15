import type { TokenProviderAuthUser } from '@commercelayer/app-elements/dist/providers/TokenProvider/types'

/* eslint-disable @typescript-eslint/promise-function-async */
export const getUserName = (
  user: TokenProviderAuthUser | null
): string | undefined => {
  return user?.email?.split('@')?.[0]
}

export const getUserDomain = (
  user: TokenProviderAuthUser | null
): string | undefined => {
  if (isTestUser(user)) {
    return 'haceb.com'
  }
  return user?.email?.split('@')?.[1]
}

export const isDomainDefined = (
  user: TokenProviderAuthUser | null
): boolean => {
  const userDomain = getUserDomain(user)
  if (userDomain != null) {
    return true
  }
  return false
}

export const isTestUser = (user: TokenProviderAuthUser | null): boolean => {
  const userName = getUserName(user)
  if (userName?.includes('haceb') === true) {
    return true
  }
  return false
}

export const isAdmin = (user: TokenProviderAuthUser | null): boolean => {
  if (isTestUser(user)) {
    return false
  }
  const userDomain = getUserDomain(user)
  if (userDomain !== 'aplyca.com' && userDomain !== 'grupovanti.com') {
    return false
  }
  return true
}
