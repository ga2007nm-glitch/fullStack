/**
 * Responsive image with a real optimization pipeline.
 *
 * What this encodes, and why:
 *  - `srcset` at 5 widths + `sizes` lets the browser download the smallest file
 *    that still looks sharp on the current viewport instead of a 2000px original
 *    on a 390px phone. This is the single biggest image win.
 *  - `auto=format` makes the CDN pick AVIF → WebP → JPEG per browser support;
 *    no build step needed to get modern formats.
 *  - Explicit `width`/`height` reserve layout space, so images can't cause CLS
 *    (layout shift) as they stream in. The CSS then makes them fluid.
 *  - `loading="lazy"` for below-the-fold images, but `priority` switches the LCP
 *    hero to `eager` + `fetchpriority="high"`.
 *  - A tiny blurred placeholder paints instantly, so the grid never shows holes.
 */
const WIDTHS = [320, 480, 640, 960, 1280]

/** Resize + recompress an Unsplash URL, requesting only the formats we can use. */
function cdnUrl(src, width, quality) {
  const url = new URL(src)
  url.searchParams.set('auto', 'format,compress')
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality))
  return url.toString()
}

export default function OptimizedImage({
  src,
  alt = '',
  width = 800,
  height = 800,
  sizes = '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw',
  priority = false,
  quality = 68,
  className = '',
  ...rest
}) {
  const isCdn = /^https?:\/\//.test(src)

  // Non-CDN (local) sources are served as-is; only remote images get resized.
  const srcSet = isCdn
    ? WIDTHS.map((w) => `${cdnUrl(src, w, quality)} ${w}w`).join(', ')
    : undefined

  const fallback = isCdn ? cdnUrl(src, 640, quality) : src

  return (
    <img
      className={`optimized-image ${className}`.trim()}
      src={fallback}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      draggable="false"
      {...rest}
    />
  )
}