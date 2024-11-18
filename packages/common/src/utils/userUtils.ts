import type { TokenProviderAuthUser } from '@commercelayer/app-elements/dist/providers/TokenProvider/types'

/* eslint-disable @typescript-eslint/promise-function-async */
export const getUserName = (
  user: TokenProviderAuthUser | null
): string | undefined => {
  return user?.email?.split('@')?.[0]
}

export const getUserDomain = (
  user: TokenProviderAuthUser | null,
  testUsers: string | undefined
): string | undefined => {
  if (user === null) {
    return ''
  }
  if (testUsers?.split(',').includes(user?.email) ?? false) {
    return 'haceb.com'
  }
  return user?.email?.split('@')?.[1]
}

export const isAdmin = (
  user: TokenProviderAuthUser | null,
  testUsers: string | undefined
): boolean => {
  const userDomain = getUserDomain(user, testUsers)
  if (user === null) {
    return false
  }

  if (
    (testUsers?.split(',').includes(user?.email) ?? false) ||
    (userDomain !== 'aplyca.com' && userDomain !== 'grupovanti.com')
  ) {
    return false
  }
  return true
}
