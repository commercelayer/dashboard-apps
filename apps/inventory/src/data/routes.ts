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
  stockLocation: {
    path: '/:stockLocationId/list',
    makePath: (stockLocationId: string) => `/${stockLocationId}/list`
  },
  stockItem: {
    path: '/:stockLocationId/list/:stockItemId',
    makePath: (stockLocationId: string, stockItemId: string) =>
      `/${stockLocationId}/list/${stockItemId}`
  },
  newStockItem: {
    path: '/:stockLocationId/new',
    makePath: (stockLocationId: string) => `/${stockLocationId}/new`
  },
  editStockItem: {
    path: '/:stockLocationId/list/:stockItemId/edit',
    makePath: (stockLocationId: string, stockItemId: string) =>
      `/${stockLocationId}/list/${stockItemId}/edit`
  }
}
