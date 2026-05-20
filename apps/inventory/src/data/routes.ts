export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: {
    path: "/",
    makePath: () => "/",
  },
  list: {
    path: "/list",
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/list/?${filters}` : `/list`,
  },
  filters: {
    path: "/filters",
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/filters/?${filters}` : `/filters`,
  },
  stockLocation: {
    path: "/:stockLocationId/list",
    makePath: (stockLocationId: string, filters?: string) =>
      hasFilterQuery(filters)
        ? `/${stockLocationId}/list/?${filters}`
        : `/${stockLocationId}/list`,
  },
  stockLocationFilters: {
    path: "/:stockLocationId/filters",
    makePath: (stockLocationId: string, filters?: string) =>
      hasFilterQuery(filters)
        ? `/${stockLocationId}/filters/?${filters}`
        : `/${stockLocationId}/filters`,
  },
  stockItem: {
    path: "/:stockLocationId?/list/:stockItemId",
    makePath: (stockLocationId: string, stockItemId: string) =>
      `/${stockLocationId !== "" ? `${stockLocationId}/` : ""}list/${stockItemId}`,
  },
  newStockItem: {
    path: "/:stockLocationId?/new",
    makePath: (stockLocationId: string) =>
      `/${stockLocationId !== "" ? `${stockLocationId}/` : ""}new`,
  },
  editStockItem: {
    path: "/:stockLocationId?/list/:stockItemId/edit",
    makePath: (stockLocationId: string, stockItemId: string) =>
      `/${stockLocationId !== "" ? `${stockLocationId}/` : ""}list/${stockItemId}/edit`,
  },
}

function hasFilterQuery(filters?: string): filters is string {
  return Array.from(new URLSearchParams(filters)).length > 0
}
