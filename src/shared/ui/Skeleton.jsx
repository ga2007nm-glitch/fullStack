/**
 * Loading placeholder.
 *
 * `aria-hidden` on the animated bar (it conveys nothing to a screen reader) while
 * the wrapper is marked `aria-busy`, so assistive tech announces "busy" once
 * rather than reading out empty skeleton boxes.
 */
export default function Skeleton({ width = '100%', height = '1rem', radius = '12px' }) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius: radius }} aria-hidden="true" />
  )
}