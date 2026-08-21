export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  /** The stock items list. The stock location used to scope it through the url; it is a filter now. */
  home: {
    path: "/",
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/?${filters}` : "/",
  },
  /**
   * Legacy path of the stock items list, now a redirect to `home`.
   * Kept because `useAppLinking` points here when linking to this app without a
   * resource id. Do not link to it from within the app.
   */
  list: {
    path: "/list",
    makePath: () => "/list",
  },
  stockItem: {
    path: "/list/:stockItemId",
    // the filters ride along, so closing the drawer returns to the list the user
    // was looking at rather than an unfiltered one
    makePath: (stockItemId: string, filters?: string) =>
      hasFilterQuery(filters)
        ? `/list/${stockItemId}?${filters}`
        : `/list/${stockItemId}`,
  },
  newStockItem: {
    path: "/new",
    makePath: () => "/new",
  },
  editStockItem: {
    path: "/list/:stockItemId/edit",
    makePath: (stockItemId: string, filters?: string) =>
      hasFilterQuery(filters)
        ? `/list/${stockItemId}/edit?${filters}`
        : `/list/${stockItemId}/edit`,
  },
}

function hasFilterQuery(filters?: string): filters is string {
  return Array.from(new URLSearchParams(filters)).length > 0
}
