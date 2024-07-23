export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: {
    path: '/',
    makePath: () => '/'
  },
  list: {
    path: '/list',
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/list/?${filters}` : `/list`
  },
  filters: {
    path: '/filters',
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/filters/?${filters}` : `/filters`
  },
  details: {
    path: '/list/:returnId',
    makePath: (returnId: string) => `/list/${returnId}`
  },
  restock: {
    path: '/list/:returnId/restock',
    makePath: (returnId: string) => `/list/${returnId}/restock`
  }
}

function hasFilterQuery(filters?: string): filters is string {
  return Array.from(new URLSearchParams(filters)).length > 0
}
