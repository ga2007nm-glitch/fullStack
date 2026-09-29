import { formatRating } from '../../../shared/lib/format.js'

/**
 * Star rating.
 *
 * Rendered as a single accessible text label plus a purely decorative star
 * strip. Screen readers announce "Rated 4.8 out of 5, 1240 reviews" once,
 * instead of reading five separate star glyphs.
 */
export default function Rating({ value, reviews, size = 'sm' }) {
  const percent = (value / 5) * 100

  return (
    <div className={`rating rating--${size}`}>
      <span className="rating__stars" aria-hidden="true">
        <span className="rating__stars-empty">★★★★★</span>
        <span className="rating__stars-filled" style={{ width: `${percent}%` }}>
          ★★★★★
        </span>
      </span>
      <span className="rating__value">{formatRating(value)}</span>
      {reviews != null && <span className="rating__reviews">({reviews})</span>}
      <span className="visually-hidden">
        Rated {formatRating(value)} out of 5
        {reviews != null ? `, ${reviews} reviews` : ''}
      </span>
    </div>
  )
}