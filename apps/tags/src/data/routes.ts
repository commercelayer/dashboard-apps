export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: {
    path: '/',
    makePath: () => `/`
  },
  list: {
    path: '/list',
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/list/?${filters}` : `/list`
  },
  new: {
    path: `/new`,
    makePath: () => `/new`
  },
  edit: {
    path: '/list/:tagId/edit',
    makePath: (tagId: string) => `/list/${tagId}/edit`
  },
  delete: {
    path: '/list/:tagId/delete',
    makePath: (tagId: string) => `/list/${tagId}/delete`
  }
}

function hasFilterQuery(filters?: string): filters is string {
  return Array.from(new URLSearchParams(filters)).length > 0
}
