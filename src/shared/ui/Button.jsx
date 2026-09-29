/** Presentational button. `as` swaps the element so links can look like buttons. */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  className = '',
  ...rest
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim()

  if (Tag === 'button') {
    return (
      <button type="button" className={classes} {...rest}>
        {children}
      </button>
    )
  }

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}