import { appRoutes } from '#data/routes'
import { useCallback } from 'react'
import { useLocation } from 'wouter'

interface PersistentBackToListItem {
  fullPath: string
  ver: number
}

const currentVersion = 0.1

export function useBackToList(): {
  goBackToList: () => void
  setBackToList: (props: { search: string }) => void
} {
  const itemName = makeStorageItemName()
  const [, setLocation] = useLocation()

  const goBackToList = useCallback(() => {
    let listPath = appRoutes.list.makePath({})
    try {
      const backTo = JSON.parse(sessionStorage.getItem(itemName) ?? '{}')
      if (backTo.fullPath != null && backTo.ver === currentVersion) {
        listPath = backTo.fullPath
      } else {
        sessionStorage.removeItem(itemName)
      }
    } catch {
      sessionStorage.removeItem(itemName)
    }
    setLocation(listPath)
  }, [itemName])

  const setBackToList = useCallback(
    ({ search }: { search: string }) => {
      const data: PersistentBackToListItem = {
        fullPath: `${appRoutes.list.makePath({})}${search}`,
        ver: currentVersion
      }
      sessionStorage.setItem(itemName, JSON.stringify(data))
    },
    [itemName]
  )

  return {
    goBackToList,
    setBackToList
  }
}

function makeStorageItemName(): string {
  const orgSlug = window.location.hostname.split('.')[0] ?? 'no-org'
  return `orders:${orgSlug}:backToList`
}
