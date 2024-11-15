/* eslint-disable @typescript-eslint/promise-function-async */

import { useTokenProvider } from '@commercelayer/app-elements'

const { user } = useTokenProvider()

export const getUserName = (): string | undefined => {
  return user?.email?.split('@')?.[0]
}

export const getUserDomain = (): string | undefined => {
  if (isTestUser()) {
    return 'haceb'
  }
  return user?.email?.split('@')?.[1]
}

export const isDomainDefined = (): boolean => {
  const userDomain = getUserDomain()
  if (userDomain != null) {
    return true
  }
  return false
}

export const isTestUser = (): boolean => {
  const userName = getUserName()
  if (userName?.includes('haceb') === true) {
    return true
  }
  return false
}

export const isAdmin = (): boolean => {
  if (isTestUser()) {
    return false
  }
  const userDomain = getUserDomain()
  if (userDomain !== 'aplyca.com' && userDomain !== 'grupovanti.com') {
    return false
  }
  return true
}
