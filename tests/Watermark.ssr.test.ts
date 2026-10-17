import { describe, expect, it } from 'vitest'
import { createSSRApp, h, resolveComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import WatermarkPlugin, { Watermark } from '../src'

// Run in Node with no browser globals, including during module import.
describe('watermark SSR', () => {
  it('renders disabled and transparent overlays without changing slot content', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          Watermark,
          { options: { disabled: true, opacity: 0, image: '/logo.svg', font: { lineHeight: 32, textAlign: 'left' } } },
          () => h('p', 'Visible slot'),
        ),
    })
    const html = await renderToString(app)
    expect(html).toContain('display:none')
    expect(html).toContain('opacity:0')
    expect(html).toContain('<p>Visible slot</p>')
  })
  it('renders a globally registered component with app-scoped defaults', async () => {
    const render = (zIndex: number) => {
      const app = createSSRApp({
        render: () => h(resolveComponent('Watermark'), {}, () => h('p', 'Global component')),
      })
      app.use(WatermarkPlugin({ content: 'Global', image: '/logo.svg', zIndex }))
      return renderToString(app)
    }
    const [first, second] = await Promise.all([render(17), render(23)])
    expect(first).toContain('z-index:17')
    expect(first).toContain('<p>Global component</p>')
    expect(second).toContain('z-index:23')
    expect(first).not.toContain('data:image')
  })
  it.each([{}, { content: 'Confidential' }, { content: ['one', 'two'], repeat: false }, { image: '/logo.svg' }])(
    'renders slot content without accessing browser APIs (%j)',
    async (options) => {
      expect(typeof window).toBe('undefined')
      expect(typeof document).toBe('undefined')
      const app = createSSRApp({
        render: () => h(Watermark, { options }, () => h('p', 'Server content')),
      })
      const html = await renderToString(app)
      expect(html).toContain('<p>Server content</p>')
      expect(html).toContain('aria-hidden="true"')
      expect(html).not.toContain('data:image')
      expect(html).not.toContain('canvas')
    },
  )
})
