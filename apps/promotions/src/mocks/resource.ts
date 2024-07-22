interface GenericResource {
  id: string
  created_at: string
  updated_at: string
}

export const makeResource = (): GenericResource => {
  return {
    id: `fake-${Math.random()}`,
    created_at: new Date().toJSON(),
    updated_at: new Date().toJSON()
  }
}
