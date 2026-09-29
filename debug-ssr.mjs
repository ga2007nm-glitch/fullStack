import { createServer } from 'vite'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { renderToString } = require('react-dom/server')
const React = require('react')
const vite = await createServer({ root, logLevel: 'error', server:{middlewareMode:true}, appType:'custom' })
const { StaticRouter } = await vite.ssrLoadModule(join(root,'node_modules','react-router-dom','server.mjs'))
const App = (await vite.ssrLoadModule('/src/app/App.jsx')).default
const el = React.createElement(StaticRouter, { location: '/' }, React.createElement(App))
const out = renderToString(el)
const i = out.indexOf('site-main')
console.log('MAIN REGION:')
console.log(out.slice(i-30, i+700))
await vite.close()
