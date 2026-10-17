import type { CSSProperties } from 'vue'
import type { WatermarkOptions } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick, reactive, ref } from 'vue'
import WatermarkPlugin, { Watermark } from '../src'
import { node, renderer } from './renderer'

function makeCanvas() {
  const context = {
    font: '',
    fillStyle: '',
    textAlign: '',
    textBaseline: '',
    measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
  }
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toDataURL: vi.fn(() => 'data:image/png;base64,dGVzdA=='),
  }
  return { canvas, context }
}

const canvases: ReturnType<typeof makeCanvas>[] = []
const cleanups: (() => void)[] = []
const images: MockImage[] = []

class MockImage {
  naturalWidth = 240
  naturalHeight = 120
  crossOrigin: string | null = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  request: { src: string; crossOrigin: string | null } | undefined

  constructor() {
    images.push(this)
  }

  set src(src: string) {
    this.request = { src, crossOrigin: this.crossOrigin }
  }

  get src() {
    return this.request?.src ?? ''
  }
}

beforeEach(() => {
  canvases.length = 0
  images.length = 0
  vi.stubGlobal('Image', MockImage)
  vi.stubGlobal('window', { devicePixelRatio: 1 })
  vi.stubGlobal('document', {
    createElement: vi.fn((tag: string) => {
      expect(tag).toBe('canvas')
      const drawing = makeCanvas()
      canvases.push(drawing)
      return drawing.canvas
    }),
  })
})

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
  vi.unstubAllGlobals()
})

async function mount(initial: WatermarkOptions = { content: 'watermark' }, pluginDefaults?: WatermarkOptions) {
  const options = ref<WatermarkOptions>(initial)
  const slotText = ref('Slot content')
  const root = node('root')
  const onLoad = vi.fn()
  const onError = vi.fn()
  const app = renderer.createApp({
    setup: () => () => h(Watermark, { options: options.value, onLoad, onError }, () => h('p', slotText.value)),
  })
  if (pluginDefaults) {
    app.use(WatermarkPlugin(pluginDefaults))
  }
  app.mount(root)
  const unmount = () => app.unmount()
  cleanups.push(unmount)
  await nextTick()
  const container = root.children[0].children[0]
  const overlay = () => container.children.find((child) => child.props['aria-hidden'] === 'true')!
  const style = () => overlay().props.style as CSSProperties
  return { app, options, slotText, root, container, overlay, style, unmount, onLoad, onError }
}

describe('watermark rendering', () => {
  it('draws once after mounting and renders one non-interactive overlay beside the slot', async () => {
    const view = await mount()
    expect(canvases).toHaveLength(1)
    expect(canvases[0].canvas.toDataURL).toHaveBeenCalledTimes(1)
    expect(view.container.children).toHaveLength(2)
    expect(view.container.children[0].text).toBe('Slot content')
    expect(view.style()).toMatchObject({
      pointerEvents: 'none',
      position: 'absolute',
      backgroundImage: "url('data:image/png;base64,dGVzdA==')",
    })
  })

  it('measures text with the selected font and evenly spaces four lines', async () => {
    const view = await mount({
      content: ['one', 'longest', 'three', 'four'],
      rotate: 0,
      repeat: false,
      font: { fontSize: 20, fontFamily: 'serif', fontWeight: 700, fontStyle: 'italic' },
    })
    const { canvas, context } = canvases[0]
    expect(context.measureText.mock.calls.map(([text]) => text)).toEqual(['one', 'longest', 'three', 'four'])
    expect(context.font).toBe('italic 700 20px serif')
    expect(canvas.width).toBe(90)
    expect(canvas.height).toBe(109)
    expect(context.fillText.mock.calls).toEqual([
      ['one', 45, 10],
      ['longest', 45, 33],
      ['three', 45, 56],
      ['four', 45, 79],
    ])
    expect(view.style().backgroundSize).toBe('90px')
  })

  it('respects explicit dimensions and scales the bitmap for high-DPI displays', async () => {
    vi.stubGlobal('window', { devicePixelRatio: 2 })
    const view = await mount({ content: 'test', width: 120, height: 64, gap: [20, 10], rotate: 0, repeat: false })
    const { canvas, context } = canvases[0]
    expect([canvas.width, canvas.height]).toEqual([280, 148])
    expect(context.font).toBe('normal normal 36px sans-serif')
    expect(context.fillText).toHaveBeenCalledWith('test', 140, 10)
    expect(view.style().backgroundSize).toBe('140px')
  })

  it('redraws when the gap array is replaced or mutated', async () => {
    const view = await mount({ content: 'test', rotate: 0, gap: [20, 20] })
    expect(view.style().backgroundSize).toBe('120px')
    view.options.value.gap = [40, 60]
    await nextTick()
    expect(canvases).toHaveLength(2)
    expect([canvases[1].canvas.width, canvases[1].canvas.height]).toEqual([160, 156])
    expect(view.style().backgroundSize).toBe('160px')
    view.options.value.gap[0] = 50
    await nextTick()
    expect(canvases).toHaveLength(3)
    expect(view.style().backgroundSize).toBe('180px')
  })

  it('responds to nested content/font edits and resets omitted options on replacement', async () => {
    const view = await mount({ content: ['first'], rotate: 0, width: 200, font: { fontSize: 20 } })
    ;(view.options.value.content as string[]).push('second')
    view.options.value.font!.fontSize = 30
    await nextTick()
    expect(canvases).toHaveLength(2)
    expect(canvases[1].context.fillText.mock.calls.map(([text]) => text)).toEqual(['first', 'second', 'first', 'second'])
    expect(canvases[1].context.font).toBe('normal normal 30px sans-serif')
    view.options.value = { content: 'new', rotate: 0 }
    await nextTick()
    expect(canvases).toHaveLength(3)
    expect(view.style().backgroundSize).toBe('100px')
    expect(canvases[2].context.font).toBe('normal normal 18px sans-serif')
  })

  it('reuses the tile for placement and slot changes without duplicating the overlay', async () => {
    const view = await mount({ content: 'test' })
    view.options.value.offset = [15, 25]
    view.options.value.zIndex = 9
    view.options.value.position = 'bottom-right'
    view.slotText.value = 'Updated slot'
    await nextTick()
    expect(canvases).toHaveLength(1)
    expect(view.container.children).toHaveLength(2)
    expect(view.container.children[0].text).toBe('Updated slot')
    expect(view.style()).toMatchObject({ left: '15px', top: '25px', zIndex: 9 })
  })

  it.each([
    ['top-left', '7px 9px'],
    ['top-middle', 'calc(50% + 7px) 9px'],
    ['top-right', 'calc(100% - 7px) 9px'],
    ['middle-left', '7px calc(50% + 9px)'],
    ['center', 'calc(50% + 7px) calc(50% + 9px)'],
    ['middle-right', 'calc(100% - 7px) calc(50% + 9px)'],
    ['bottom-left', '7px calc(100% - 9px)'],
    ['bottom-middle', 'calc(50% + 7px) calc(100% - 9px)'],
    ['bottom-right', 'calc(100% - 7px) calc(100% - 9px)'],
  ] as const)('positions a single watermark at %s without redrawing', async (position, expected) => {
    const view = await mount({ content: 'test', repeat: false, rotate: 0, offset: [7, 9] })
    view.options.value.position = position
    await nextTick()
    expect(view.style().backgroundPosition).toBe(expected)
    expect(canvases).toHaveLength(1)
    // The single tile must be centered around the text, not an empty second cell.
    expect(canvases[0].canvas.width).toBe(60)
    expect(canvases[0].context.fillText).toHaveBeenCalledTimes(1)
  })

  it('switches between staggered repetition and a centered single tile', async () => {
    const view = await mount({ content: 'test', rotate: 0, offset: [10, 20] })
    expect(canvases[0].context.fillText.mock.calls).toEqual([
      ['test', 30, 10],
      ['test', 90, 48],
    ])
    view.options.value.repeat = false
    await nextTick()
    expect(canvases[1].context.fillText.mock.calls).toEqual([['test', 30, 10]])
    expect(view.style()).toMatchObject({ left: '0', top: '0', width: '100%', height: '100%', backgroundRepeat: 'no-repeat' })
    view.options.value.repeat = true
    await nextTick()
    expect(canvases[2].context.fillText).toHaveBeenCalledTimes(2)
  })

  it('allocates enough room for rotated text', async () => {
    await mount({ content: 'long text', width: 120, height: 20, gap: [0, 0], rotate: 45, repeat: false })
    const { canvas, context } = canvases[0]
    expect([canvas.width, canvas.height]).toEqual([99, 99])
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 4)
    expect(context.save).toHaveBeenCalledTimes(1)
    expect(context.restore).toHaveBeenCalledTimes(1)
  })

  it.each(['', []])('clears an existing watermark for empty content %j', async (content) => {
    const view = await mount()
    view.options.value.content = content
    await nextTick()
    expect(view.style().backgroundImage).toBeUndefined()
    expect(canvases).toHaveLength(1)
  })

  it('allows mounting without content and draws when content arrives', async () => {
    const view = await mount({})
    expect(canvases).toHaveLength(0)
    view.options.value.content = 'ready'
    await nextTick()
    expect(canvases).toHaveLength(1)
    expect(view.style().backgroundImage).toBeDefined()
  })

  it('keeps slot content usable when a canvas context is unavailable', async () => {
    vi.stubGlobal('document', { createElement: () => ({ getContext: () => null }) })
    const view = await mount()
    expect(view.container.children[0].text).toBe('Slot content')
    expect(view.style().backgroundImage).toBeUndefined()
  })

  it('stops drawing after unmount', async () => {
    const view = await mount()
    view.unmount()
    cleanups.pop()
    view.options.value.content = 'after unmount'
    await nextTick()
    expect(view.root.children).toHaveLength(0)
    expect(canvases).toHaveLength(1)
  })
})

describe('image watermarks', () => {
  it('loads with anonymous CORS before drawing and gives images precedence over text', async () => {
    const view = await mount({ image: '/logo.png', content: 'ignored', repeat: false, rotate: 0 })
    expect(images[0].request).toEqual({ src: '/logo.png', crossOrigin: 'anonymous' })
    expect(canvases).toHaveLength(0)
    expect(view.style().backgroundImage).toBeUndefined()
    images[0].onload!()
    await nextTick()
    expect(canvases[0].context.drawImage).toHaveBeenCalledWith(images[0], 10, 10, 240, 120)
    expect(canvases[0].context.fillText).not.toHaveBeenCalled()
    expect([canvases[0].canvas.width, canvases[0].canvas.height]).toEqual([260, 140])
    expect(view.onLoad).toHaveBeenCalledExactlyOnceWith({ src: '/logo.png', width: 240, height: 120 })
    expect(view.onError).not.toHaveBeenCalled()
  })

  it.each([
    [{ width: 100 }, 100, 50],
    [{ height: 40 }, 80, 40],
    [{ width: 100, height: 100 }, 100, 50],
    [{ width: 300, height: 60 }, 120, 60],
  ])('preserves aspect ratio for dimensions %j', async (dimensions, width, height) => {
    await mount({ image: '/logo.png', repeat: false, rotate: 0, ...dimensions })
    images[0].onload!()
    await nextTick()
    expect(canvases[0].context.drawImage).toHaveBeenCalledWith(images[0], 10, 10, width, height)
  })

  it('supports high-DPI, rotation, and staggered repetition', async () => {
    vi.stubGlobal('window', { devicePixelRatio: 2 })
    await mount({ image: '/logo.png', width: 100, rotate: 90, gap: [20, 20] })
    images[0].onload!()
    await nextTick()
    const { context, canvas } = canvases[0]
    expect(context.drawImage).toHaveBeenCalledTimes(2)
    expect(context.drawImage.mock.calls[0].slice(3)).toEqual([200, 100])
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 2)
    expect(canvas.width).toBeCloseTo(280, 0)
    expect(canvas.height).toBe(480)
  })

  it('reuses the loaded image for resizing and the tile for placement updates', async () => {
    const view = await mount({ image: '/logo.png', rotate: 0, repeat: false })
    images[0].onload!()
    await nextTick()
    view.options.value.width = 80
    await nextTick()
    expect(images).toHaveLength(1)
    expect(canvases).toHaveLength(2)
    expect(canvases[1].context.drawImage).toHaveBeenCalledWith(images[0], 10, 10, 80, 40)
    view.options.value.position = 'bottom-right'
    view.options.value.offset = [10, 15]
    await nextTick()
    expect(canvases).toHaveLength(2)
    expect(view.style().backgroundPosition).toBe('calc(100% - 10px) calc(100% - 15px)')
    expect(view.onLoad).toHaveBeenCalledTimes(1)
  })

  it('uses the latest dimensions when options change during loading', async () => {
    const view = await mount({ image: '/logo.png', rotate: 0, repeat: false })
    view.options.value.width = 80
    await nextTick()
    images[0].onload!()
    await nextTick()
    expect(images).toHaveLength(1)
    expect(canvases[0].context.drawImage).toHaveBeenCalledWith(images[0], 10, 10, 80, 40)
  })

  it('ignores stale load and error callbacks when the source changes', async () => {
    const view = await mount({ image: '/old.png' })
    const staleLoad = images[0].onload!
    const staleError = images[0].onerror!
    view.options.value.image = '/new.png'
    // Even callbacks queued before the watcher flush must not draw the old source.
    staleLoad()
    staleError()
    await nextTick()
    staleLoad()
    staleError()
    expect(view.onLoad).not.toHaveBeenCalled()
    expect(view.onError).not.toHaveBeenCalled()
    expect(canvases).toHaveLength(0)
    expect(images[0].onload).toBeNull()
    images[1].onload!()
    await nextTick()
    expect(view.onLoad).toHaveBeenCalledExactlyOnceWith({ src: '/new.png', width: 240, height: 120 })
  })

  it.each(['use-credentials', null] as const)('reloads when CORS changes to %s', async (crossOrigin) => {
    const view = await mount({ image: '/logo.png' })
    images[0].onload!()
    await nextTick()
    view.options.value.crossOrigin = crossOrigin
    await nextTick()
    expect(images).toHaveLength(2)
    expect(images[1].request).toEqual({ src: '/logo.png', crossOrigin })
    expect(view.style().backgroundImage).toBeUndefined()
    images[1].onload!()
    await nextTick()
    expect(view.style().backgroundImage).toBeDefined()
  })

  it('switches from text to image and back without retaining stale content', async () => {
    const view = await mount({ content: 'text' })
    view.options.value.image = '/logo.png'
    await nextTick()
    expect(view.style().backgroundImage).toBeUndefined()
    images[0].onload!()
    await nextTick()
    view.options.value.image = undefined
    await nextTick()
    expect(canvases.at(-1)!.context.fillText).toHaveBeenCalled()
    expect(canvases.at(-1)!.context.drawImage).not.toHaveBeenCalled()
    view.options.value.crossOrigin = null
    await nextTick()
    expect(view.style().backgroundImage).toBeDefined()
  })

  it('reports load failures, clears the previous tile, and recovers with a new source', async () => {
    const view = await mount({ image: '/logo.png', content: 'ignored' })
    images[0].onload!()
    await nextTick()
    view.options.value.image = '/missing.png'
    await nextTick()
    images[1].onerror!()
    await nextTick()
    expect(view.onError).toHaveBeenCalledExactlyOnceWith({ src: '/missing.png', error: expect.any(Error) })
    expect(view.style().backgroundImage).toBeUndefined()
    expect(view.container.children[0].text).toBe('Slot content')
    view.options.value.image = '/replacement.png'
    await nextTick()
    images[2].onload!()
    await nextTick()
    expect(view.style().backgroundImage).toBeDefined()
  })

  it('reports canvas export failures without an uncaught exception or load success', async () => {
    const securityError = new Error('Tainted canvas')
    vi.stubGlobal('document', {
      createElement: () => {
        const { canvas } = makeCanvas()
        canvas.toDataURL.mockImplementation(() => {
          throw securityError
        })
        return canvas
      },
    })
    const view = await mount({ image: 'https://example.com/logo.png', crossOrigin: null })
    images[0].onload!()
    await nextTick()
    expect(view.onError).toHaveBeenCalledExactlyOnceWith({ src: 'https://example.com/logo.png', error: securityError })
    expect(view.onLoad).not.toHaveBeenCalled()
    expect(view.style().backgroundImage).toBeUndefined()
  })

  it('reports unusable images', async () => {
    const view = await mount({ image: '/empty.svg' })
    images[0].naturalWidth = 0
    images[0].onload!()
    await nextTick()
    expect(view.onError).toHaveBeenCalledExactlyOnceWith({ src: '/empty.svg', error: expect.any(Error) })
    expect(canvases).toHaveLength(0)
  })

  it('detaches pending image handlers on unmount and ignores late callbacks', async () => {
    const view = await mount({ image: '/logo.png' })
    const lateLoad = images[0].onload!
    const lateError = images[0].onerror!
    view.unmount()
    cleanups.pop()
    lateLoad()
    lateError()
    await nextTick()
    expect(images[0].onload).toBeNull()
    expect(images[0].onerror).toBeNull()
    expect(canvases).toHaveLength(0)
    expect(view.onLoad).not.toHaveBeenCalled()
    expect(view.onError).not.toHaveBeenCalled()
  })
})

describe('plugin defaults', () => {
  it('registers Watermark globally and supplies options to imported components', async () => {
    const view = await mount({}, { content: 'Global', rotate: 0, zIndex: 17 })
    expect(view.app.component('Watermark')).toBe(Watermark)
    expect(canvases[0].context.fillText).toHaveBeenCalledWith('Global', 40, 10)
    expect(view.style()).toMatchObject({ zIndex: 17, backgroundSize: '160px' })
  })

  it('merges built-in, plugin, and local font fields while replacing arrays', async () => {
    const view = await mount(
      {
        content: 'Local',
        font: { fontSize: 30, color: 'blue' },
        gap: [5, 10],
        offset: [0, 0],
        rotate: 0,
        repeat: false,
        zIndex: 0,
      },
      {
        content: 'Global',
        font: { fontFamily: 'serif', fontSize: 22, fontWeight: 'bold', color: 'red' },
        gap: [40, 60],
        offset: [15, 25],
        zIndex: 17,
      },
    )
    expect(canvases[0].context.font).toBe('normal bold 30px serif')
    expect(canvases[0].context.fillStyle).toBe('blue')
    expect(canvases[0].context.fillText.mock.calls).toEqual([['Local', 27.5, 5]])
    expect(view.style()).toMatchObject({
      backgroundSize: '55px',
      backgroundPosition: '0px 0px',
      zIndex: 0,
      backgroundRepeat: 'no-repeat',
    })
  })

  it('treats undefined fields as inherited at both option and font levels', async () => {
    await mount(
      {
        content: undefined,
        width: undefined,
        rotate: undefined,
        font: { fontSize: undefined, fontFamily: undefined, color: undefined },
      },
      {
        content: 'Global',
        width: 100,
        rotate: 0,
        repeat: false,
        font: { fontSize: 24, fontFamily: 'serif', color: 'red', fontStyle: undefined },
      },
    )
    expect(canvases[0].context.font).toBe('normal normal 24px serif')
    expect(canvases[0].context.fillStyle).toBe('red')
    expect(canvases[0].context.fillText).toHaveBeenCalledWith('Global', 60, 10)
  })

  it('allows local null values to disable an image and restore automatic sizing', async () => {
    const view = await mount(
      { image: null, width: null, height: null },
      { image: '/global.png', content: 'Text', width: 200, height: 100, rotate: 0, repeat: false },
    )
    expect(images).toHaveLength(0)
    expect([canvases[0].canvas.width, canvases[0].canvas.height]).toEqual([60, 38])
    expect(view.style().backgroundImage).toBeDefined()
    view.options.value.content = null
    await nextTick()
    expect(view.style().backgroundImage).toBeUndefined()
    view.options.value.content = undefined
    await nextTick()
    expect(view.style().backgroundImage).toBeDefined()
  })

  it('inherits image defaults and allows overriding CORS with null', async () => {
    const view = await mount(
      { crossOrigin: null },
      { image: '/global.png', content: 'Text', width: 100, crossOrigin: 'use-credentials', rotate: 0, repeat: false },
    )
    expect(images[0].request).toEqual({ src: '/global.png', crossOrigin: null })
    images[0].onload!()
    await nextTick()
    expect(canvases[0].context.drawImage).toHaveBeenCalledWith(images[0], 10, 10, 100, 50)
    view.options.value.image = ''
    await nextTick()
    expect(canvases[1].context.fillText).toHaveBeenCalledWith('Text', 60, 10)
  })

  it('updates reactive plugin defaults while retaining local overrides', async () => {
    const defaults = reactive<WatermarkOptions>({ content: 'Before', rotate: 0, font: { fontSize: 20 } })
    const view = await mount({ repeat: false, font: { color: 'blue' } }, defaults)
    defaults.content = 'After'
    defaults.font!.fontSize = 30
    defaults.font!.color = 'red'
    defaults.gap = [40, 50]
    await nextTick()
    expect(canvases).toHaveLength(2)
    expect(canvases[1].context.fillText.mock.calls).toEqual([['After', 45, 25]])
    expect(canvases[1].context.font).toBe('normal normal 30px sans-serif')
    expect(canvases[1].context.fillStyle).toBe('blue')
    view.options.value.font = undefined
    await nextTick()
    expect(canvases[2].context.fillStyle).toBe('red')
    expect(defaults.font!.color).toBe('red')
  })

  it('isolates defaults between apps and components', async () => {
    const defaults = { content: 'First', rotate: 0, font: { color: 'red' } }
    const first = await mount({}, defaults)
    const second = await mount({}, { content: 'Second', rotate: 0, font: { color: 'blue' } })
    expect(canvases[0].context.fillStyle).toBe('red')
    expect(canvases[1].context.fillStyle).toBe('blue')
    first.options.value.font = { color: 'green' }
    await nextTick()
    expect(defaults.font.color).toBe('red')
    expect(second.style().backgroundSize).toBe('160px')
    const third = await mount({ content: 'Third', rotate: 0 })
    expect(canvases.at(-1)!.context.fillStyle).toBe('rgba(0,0,0,.2)')
    expect(third.style().backgroundSize).toBe('140px')
  })
})

describe('visibility and text layout', () => {
  it.each([0, 0.4, 1])('changes opacity to %s without redrawing or fading slot content', async (opacity) => {
    const view = await mount()
    view.options.value.opacity = opacity
    await nextTick()
    expect(view.style().opacity).toBe(opacity)
    expect(view.container.props.style).toEqual({ position: 'relative' })
    expect(canvases).toHaveLength(1)
    expect(canvases[0].context.fillStyle).toBe('rgba(0,0,0,.2)')
  })

  it.each([
    [-1, 0],
    [2, 1],
    [Number.NaN, 1],
    [Infinity, 1],
  ])('normalizes opacity %s to %s', async (opacity, expected) => {
    const view = await mount({ content: 'Text', opacity })
    expect(view.style().opacity).toBe(expected)
  })

  it('skips text drawing while disabled and renders the latest options when enabled', async () => {
    const view = await mount({ content: 'Before', disabled: true, rotate: 0 })
    expect(canvases).toHaveLength(0)
    expect(view.style().display).toBe('none')
    expect(view.container.children[0].text).toBe('Slot content')
    view.options.value.content = 'After'
    view.options.value.font = { lineHeight: 32, textAlign: 'left' }
    await nextTick()
    expect(canvases).toHaveLength(0)
    view.options.value.disabled = false
    await nextTick()
    expect(canvases).toHaveLength(1)
    expect(canvases[0].context.fillText).toHaveBeenCalledWith('After', 10, 10)
    expect(view.style().display).toBeUndefined()
    view.options.value.disabled = true
    await nextTick()
    expect(view.style().backgroundImage).toBeUndefined()
    expect(canvases).toHaveLength(1)
  })

  it('defers image loading until enabled, including source changes while disabled', async () => {
    const view = await mount({ image: '/first.png', disabled: true })
    view.options.value.image = '/latest.png'
    await nextTick()
    expect(images).toHaveLength(0)
    view.options.value.disabled = false
    await nextTick()
    expect(images).toHaveLength(1)
    expect(images[0].src).toBe('/latest.png')
    images[0].onload!()
    await nextTick()
    expect(view.style().backgroundImage).toBeDefined()
    view.options.value.opacity = 0.3
    await nextTick()
    expect(canvases).toHaveLength(1)
    expect(images).toHaveLength(1)
    expect(view.style().opacity).toBe(0.3)
  })

  it('ignores pending image callbacks when disabled and reloads on re-enable', async () => {
    const view = await mount({ image: '/logo.png' })
    const lateLoad = images[0].onload!
    const lateError = images[0].onerror!
    view.options.value.disabled = true
    lateLoad()
    lateError()
    await nextTick()
    lateLoad()
    lateError()
    expect(view.onLoad).not.toHaveBeenCalled()
    expect(view.onError).not.toHaveBeenCalled()
    expect(images[0].onload).toBeNull()
    expect(canvases).toHaveLength(0)
    view.options.value.disabled = false
    await nextTick()
    images[1].onload!()
    await nextTick()
    expect(view.onLoad).toHaveBeenCalledTimes(1)
    expect(view.style().display).toBeUndefined()
  })

  it('uses pixel line heights in measurement and high-DPI drawing', async () => {
    vi.stubGlobal('window', { devicePixelRatio: 2 })
    const view = await mount({
      content: ['One', 'Two', 'Three'],
      repeat: false,
      rotate: 0,
      font: { fontSize: 20, lineHeight: 32 },
    })
    expect(canvases[0].canvas.height).toBe(208)
    expect(canvases[0].context.fillText.mock.calls.map((call) => call[2])).toEqual([20, 84, 148])
    view.options.value.font!.lineHeight = 40
    await nextTick()
    expect(canvases[1].canvas.height).toBe(240)
    expect(canvases[1].context.fillText.mock.calls.map((call) => call[2])).toEqual([20, 100, 180])
    view.options.value.font!.lineHeight = null
    await nextTick()
    expect(canvases[2].context.fillText.mock.calls.map((call) => call[2])).toEqual([20, 66, 112])
  })

  it.each([0, -10, Number.NaN, Infinity])('uses automatic spacing for invalid line height %s', async (lineHeight) => {
    await mount({ content: ['One', 'Two'], repeat: false, rotate: 0, font: { fontSize: 20, lineHeight } })
    expect(canvases[0].context.fillText.mock.calls.map((call) => call[2])).toEqual([10, 33])
    expect(canvases[0].canvas.height).toBe(63)
  })

  it.each([
    ['left', 20],
    ['center', 120],
    ['right', 220],
  ] as const)('aligns lines to %s within an explicit text width', async (textAlign, x) => {
    vi.stubGlobal('window', { devicePixelRatio: 2 })
    await mount({ content: ['Short', 'Longer'], width: 100, rotate: 15, repeat: false, font: { textAlign } })
    const { context } = canvases[0]
    const centerX = context.translate.mock.calls[0][0]
    const expectedX = centerX + x - 120
    expect(context.textAlign).toBe(textAlign)
    expect(context.fillText.mock.calls.map((call) => call[1])).toEqual([expectedX, expectedX])
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 12)
  })

  it('updates alignment for auto-sized, repeating multiline text', async () => {
    const view = await mount({ content: ['A', 'Longest'], rotate: 0, font: { textAlign: 'left' } })
    expect(canvases[0].context.fillText.mock.calls.map((call) => call[1])).toEqual([10, 10, 100, 100])
    view.options.value.font!.textAlign = 'right'
    await nextTick()
    expect(canvases[1].context.textAlign).toBe('right')
    expect(canvases[1].context.fillText.mock.calls.map((call) => call[1])).toEqual([80, 80, 170, 170])
  })

  it('ignores line height and alignment changes for images', async () => {
    const view = await mount({ image: '/logo.png', font: { lineHeight: 40, textAlign: 'left' } })
    images[0].onload!()
    await nextTick()
    view.options.value.font!.lineHeight = 50
    view.options.value.font!.textAlign = 'right'
    await nextTick()
    expect(canvases).toHaveLength(1)
    expect(images).toHaveLength(1)
  })

  it('inherits global visibility and layout options with explicit local resets', async () => {
    const defaults = reactive<WatermarkOptions>({
      content: ['One', 'Two'],
      opacity: 0.4,
      disabled: true,
      rotate: 0,
      repeat: false,
      font: { lineHeight: 40, textAlign: 'left' },
    })
    const view = await mount({}, defaults)
    expect(canvases).toHaveLength(0)
    expect(view.style()).toMatchObject({ display: 'none', opacity: 0.4 })
    view.options.value = { disabled: false, opacity: 0, font: { lineHeight: null, textAlign: 'right' } }
    await nextTick()
    expect(view.style()).toMatchObject({ display: undefined, opacity: 0 })
    expect(canvases[0].context.textAlign).toBe('right')
    expect(canvases[0].context.fillText.mock.calls).toEqual([
      ['One', 40, 10],
      ['Two', 40, 31],
    ])
  })
})
