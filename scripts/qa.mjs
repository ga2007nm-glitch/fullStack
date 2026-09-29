/**
 * End-to-end QA for the Lumen catalog against the production build.
 * Drives real user flows: navigate, filter, sort, add to cart, check persistence.
 *
 * Run against a served build:
 *   1. npm run build
 *   2. npx vite preview --port 4180
 *   3. node <browser-automation skill>/browser.mjs ${ORIGIN}/ --script ./scripts/qa.mjs
 *
 * The port is hard-coded to 4180 so it never collides with the default preview
 * port (4173) that may already be running.
 */
const ORIGIN = process.env.QA_ORIGIN ?? 'http://localhost:4180'

export default async function run(page, ui) {
  const results = {}

  // ---- 1. Client-side routing: click through to a product ----------------
  const home = await ui.snapshot()
  results.homeHasCatalogLink = home.includes('/shop')

  await page.goto(`${ORIGIN}/shop`)
  await page.waitForSelector('.product-card')

  results.shop = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.innerText,
    cards: document.querySelectorAll('.product-card').length,
    // Catalog page should render all 12 products with no filters applied.
    countText: document.querySelector('.filters__status span')?.innerText
  }))

  // ---- 2. Category filter writes to the URL ------------------------------
  await page.goto(`${ORIGIN}/shop?category=audio`)
  await page.waitForSelector('.product-card')
  results.audioFilter = await page.evaluate(() => ({
    url: location.search,
    cards: document.querySelectorAll('.product-card').length,
    names: [...document.querySelectorAll('.product-card__name')].map((e) => e.innerText)
  }))

  // ---- 3. Sort by price ascending ----------------------------------------
  await page.goto(`${ORIGIN}/shop?sort=price-asc`)
  await page.waitForSelector('.product-card')
  results.priceSorted = await page.evaluate(() =>
    [...document.querySelectorAll('.product-card__price strong')].map((e) =>
      Number(e.innerText.replace(/[^0-9.]/g, ''))
    )
  )
  results.priceIsAscending = results.priceSorted.every(
    (v, i, a) => i === 0 || a[i - 1] <= v
  )

  // ---- 4. Search filtering ------------------------------------------------
  await page.goto(`${ORIGIN}/shop?q=lamp`)
  await page.waitForSelector('.product-card')
  results.searchLamp = await page.evaluate(() => ({
    cards: document.querySelectorAll('.product-card').length,
    names: [...document.querySelectorAll('.product-card__name')].map((e) => e.innerText)
  }))

  // ---- 5. Deep link to a product page (pre-rendered route) ----------------
  await page.goto(`${ORIGIN}/product/halo-desk-lamp`)
  await page.waitForSelector('h1')
  results.productPage = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.innerText,
    price: document.querySelector('.detail__price strong')?.innerText,
    specRows: document.querySelectorAll('.spec-table tr').length,
    jsonLd: !!document.querySelector('script[type="application/ld+json"]'),
    related: document.querySelectorAll('.product-card').length
  }))

  // ---- 6. Add to cart, verify the badge and persistence -------------------
  await ui.click(
    // Add-to-cart button on the product detail page
    (await ui.snapshot()).match(/@(e\d+) button "Add 1 to cart"/)?.[1] ??
      (await ui.snapshot()).match(/@(e\d+) button "Add to cart"/)?.[1]
  )
  await page.waitForTimeout(300)

  results.cartBadge = await page.evaluate(
    () => document.querySelector('.cart-button__count')?.innerText
  )

  // Reload — the cart is persisted to localStorage, so the badge must survive.
  await page.reload()
  await page.waitForSelector('h1')
  results.cartBadgeAfterReload = await page.evaluate(
    () => document.querySelector('.cart-button__count')?.innerText
  )

  // ---- 7. Cart page totals ------------------------------------------------
  await page.goto(`${ORIGIN}/cart`)
  await page.waitForSelector('.cart-line')
  results.cartPage = await page.evaluate(() => ({
    lines: document.querySelectorAll('.cart-line').length,
    unit: document.querySelector('.cart-line__unit')?.innerText,
    total: document.querySelector('.cart-summary__total dd')?.innerText,
    subtotal: document.querySelector('.cart-summary__lines dd')?.innerText
  }))

  // ---- 8. Quantity stepper updates the total ------------------------------
  const qtyBefore = results.cartPage.total
  await ui.click((await ui.snapshot()).match(/@(e\d+) button "Increase quantity of/)?.[1])
  await page.waitForTimeout(300)
  results.totalAfterIncrement = await page.evaluate(
    () => document.querySelector('.cart-summary__total dd')?.innerText
  )
  results.totalChanged = qtyBefore !== results.totalAfterIncrement

  // ---- 9. 404 catch-all route --------------------------------------------
  await page.goto(`${ORIGIN}/this-page-does-not-exist`)
  await page.waitForTimeout(400)
  results.notFound = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.innerText,
    bodyChars: document.body.innerText.length
  }))

  return results
}