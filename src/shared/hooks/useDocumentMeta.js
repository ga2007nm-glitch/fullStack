import { useEffect } from 'react'

/**
 * Imperative document title/meta setter.
 *
 * Client-side routing does not touch the document head, so without this every
 * route would keep the homepage's title — bad for tabs, history and SEO. The
 * pre-renderer writes the same tags into the static HTML, so the value a
 * crawler reads matches the value the client sets after hydration.
 */
export default function useDocumentMeta({ title, description }) {
  useEffect(() => {
    if (title) document.title = title

    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }
  }, [title, description])
}