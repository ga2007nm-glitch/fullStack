/** Formatting helpers — all locale-aware, no manual string concatenation. */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact' })

export const formatPrice = (value) => currencyFormatter.format(value)

export const formatCount = (value) => compactFormatter.format(value)

/** `4.5` → `"4.5"`, `5` → `"5.0"` — keeps rating columns aligned. */
export const formatRating = (value) => Number(value).toFixed(1)

/** Percentage saved, or `null` when the item is not discounted. */
export function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return null
  return Math.round(((compareAt - price) / compareAt) * 100)
}

/** URL-safe slug, used for product ids. */
export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')