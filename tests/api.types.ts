// Compile-only public API examples, checked by `tsc --noEmit`.
import type { WatermarkFont, WatermarkImageErrorEvent, WatermarkImageLoadEvent, WatermarkOptions } from '../src'
import { createApp, h, ref } from 'vue'
import WatermarkPlugin, { Watermark } from '../src'

const options = ref<WatermarkOptions>({
  content: ['Confidential', 'Review copy'],
  image: null,
  opacity: 0.4,
  disabled: false,
  width: null,
  height: null,
  offset: [null, 16],
  font: { fontSize: '18', fontWeight: 'bold', fontStyle: 'italic', lineHeight: null, textAlign: 'left' },
})

const app = createApp({
  render: () =>
    h(
      Watermark,
      {
        options: options.value,
        onLoad: (event: WatermarkImageLoadEvent) => {
          event.width.toFixed()
        },
        onError: (event: WatermarkImageErrorEvent) => {
          event.error.message.toUpperCase()
        },
      },
      () => h('div', 'Content'),
    ),
})
app.use(WatermarkPlugin({ font: { fontWeight: '700' } }))

function acceptFont(_font: WatermarkFont) {}

acceptFont({ fontSize: 24, fontWeight: 300, fontStyle: 'oblique', fontFamily: 'serif', color: '#333' })
// @ts-expect-error CSS lengths are not accepted; the renderer expects a numeric pixel size.
acceptFont({ fontSize: '18px' })
// @ts-expect-error "light" is not a CSS font weight; use 300 instead.
acceptFont({ fontWeight: 'light' })
// @ts-expect-error "weight" is not a CSS font weight; use "bold" or a numeric weight.
acceptFont({ fontWeight: 'weight' })
// @ts-expect-error Use "normal" to reset font style.
acceptFont({ fontStyle: 'none' })
// @ts-expect-error The documented field is fontSize, not size.
acceptFont({ size: 18 })
// @ts-expect-error Line height is expressed in numeric pixels, not CSS lengths.
acceptFont({ lineHeight: '32px' })
// @ts-expect-error Canvas watermark lines do not support justified text.
acceptFont({ textAlign: 'justify' })
