import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()
const port = Number.parseInt(process.env['PORT'] ?? '3000', 10)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
