/**
 * Generate a URL-friendly string starting from another string (eg. a title).
 * @param text - The given string to be transformed.
 * @returns a string that is URL-friendly by removing unwanted characters and symbols.
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}
