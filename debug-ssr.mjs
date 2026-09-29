import { createServer } from 'vite'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { renderToString } = require('react-dom/server')
const React = require('react')
const vite = await createServer({ root, logLevel: 'error', server:{middlewareMode:true}, appType:'custom' })
const routerPath = join(root, 'node_modules', 'react-router-dom', 'server.mjs')
const { StaticRouter } = await vite.ssrLoadModule(routerPath)
await vite.ssrLoadModule('/src/features/catalog/pages/HomePage.jsx')
const App = (await vite.ssrLoadModule('/src/app/App.jsx')).default
const el = React.createElement(StaticRouter, { location: '/' }, React.createElement(App))
const out = renderToString(el)
console.log('LENGTH:', out.length)
console.log('HAS H1:', out.includes('<h1'))
console.log('---')
console.log(out.slice(0, 700))
await vite.close()
