/* eslint-disable @typescript-eslint/promise-function-async */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
