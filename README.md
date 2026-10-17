# @watermarkify/vue-watermark

[![NPM version](https://img.shields.io/npm/v/@watermarkify/vue-watermark.svg)](https://www.npmjs.com/package/@watermarkify/vue-watermark) [![License](https://img.shields.io/npm/l/@watermarkify/vue-watermark.svg)](https://github.com/watermarkify/vue-watermark/blob/master/LICENSE) [![Total NPM Download](https://img.shields.io/npm/dt/@watermarkify/vue-watermark.svg)](https://www.npmjs.com/package/@watermarkify/vue-watermark)

`@watermarkify/vue-watermark` is a lightweight and customizable Vue.js component that allows you to easily add watermarks to your web applications. With Vue Watermark, you can overlay images or text on top of images, videos, or any other HTML elements to protect your content or add branding.

<div align="center">
  <img src="https://github.com/watermarkify/vue-watermark/assets/35857179/ae34bbc0-28a4-4dde-9dd8-36390ad54140" alt="demo" align="center">
</div>

## Features

- Simple integration: Easily add watermarks to your Vue.js applications with just a few lines of code.
- Customizable options: Customize the watermark's appearance, position, size, and more to suit your needs.
- Support for images and text: Add watermark images or text, and control various properties such as font style, color, and size.
- Responsive design: The watermark adapts to different screen sizes and device orientations.

## Installation

You can install `@watermarkify/vue-watermark` via npm or yarn:

```bash
npm install @watermarkify/vue-watermark
# or
yarn add @watermarkify/vue-watermark
# or
pnpm install @watermarkify/vue-watermark
```

## Usage

Import the component directly, or register it globally with the plugin. Try the [interactive playground](https://watermarkify.github.io/vue-watermark/) for text and image examples.

```vue
<script setup lang="ts">
import type { WatermarkOptions } from '@watermarkify/vue-watermark'
import { Watermark } from '@watermarkify/vue-watermark'
import { ref } from 'vue'

const watermarkOptions = ref<WatermarkOptions>({
  content: 'watermark',
  gap: [20, 20],
  offset: [10, 10],
  rotate: -20,
  repeat: true,
  font: { fontSize: 18, fontWeight: 'bold' },
})
</script>

<template>
  <Watermark :options="watermarkOptions">
    <div>This is the content of the slot.</div>
  </Watermark>
</template>
```

`options` is the component's only configuration prop and is optional. A default slot with exactly one root content node is required; wrap multiple siblings in a single element. The component adds two wrapper divs and a non-interactive overlay. Classes, styles, and other fallthrough attributes apply to the outer wrapper.

### Global registration and defaults

The package's **default export is a plugin factory**. Call it with your defaults, then pass the returned plugin to `app.use`:

```ts
import { createApp } from 'vue'
import WatermarkPlugin from '@watermarkify/vue-watermark'
import App from './App.vue'

createApp(App)
  .use(
    WatermarkPlugin({
      content: 'Confidential',
      rotate: -20,
      font: { fontSize: 20, color: 'rgba(0,0,0,.15)' },
    }),
  )
  .mount('#app')
```

The globally registered component can be used without importing it in each component:

```vue
<template>
  <Watermark :options="{ font: { fontWeight: 'bold' } }">
    <div>Uses the global text, size, and color, with a local bold font.</div>
  </Watermark>
</template>
```

Defaults apply to both globally registered and directly imported `Watermark` components in that app. Call `WatermarkPlugin()` to register the component without custom defaults.

Options merge in this order: **built-in defaults → plugin defaults → component options**. `font` merges field by field; `gap` and `offset` replace the whole array. Omitted or `undefined` fields inherit. Explicit `false`, `0`, empty strings, and supported `null` values override inherited values:

- Set `image: null` or `image: ''` to disable a global image and use text.
- Set `content: null`, `content: ''`, or `content: []` to clear text when no image is active.
- Set `width: null` and/or `height: null` to restore automatic sizing.
- Set `crossOrigin: null` to omit the image CORS attribute.

Defaults stay scoped to their Vue app and are not mutated by component overrides. For live updates, pass a Vue `reactive<WatermarkOptions>(...)` object to the plugin and mutate that object. Plain objects configure static defaults. Install the plugin before mounting the app.

### Image watermarks

```vue
<script setup lang="ts">
import type { WatermarkImageErrorEvent, WatermarkImageLoadEvent, WatermarkOptions } from '@watermarkify/vue-watermark'
import { Watermark } from '@watermarkify/vue-watermark'

const options: WatermarkOptions = {
  image: '/logo.png',
  width: 96,
  repeat: false,
  position: 'bottom-right',
  rotate: 0,
  offset: [16, 16],
  crossOrigin: 'anonymous',
}

function onLoad(event: WatermarkImageLoadEvent) {
  console.log('Image ready:', event.src, event.width, event.height)
}

function onError(event: WatermarkImageErrorEvent) {
  console.error('Watermark failed:', event.src, event.error)
}
</script>

<template>
  <Watermark :options="options" @load="onLoad" @error="onError">
    <div>Your content</div>
  </Watermark>
</template>
```

Images take priority over `content`. With neither dimension set, the image uses its intrinsic size. Setting one dimension preserves its aspect ratio; setting both fits the image inside that bounding box without stretching. Transparent pixels are preserved, and rotation, repetition, gaps, offsets, and positions work with images as well as text. Use `opacity` to fade the overlay; it multiplies any transparency already in the image.

`image` accepts relative or absolute URLs, data URLs, and browser-created object URLs. Image loading starts after mount. A source change clears the previous watermark while the new image loads, and outdated load callbacks are ignored. Setting `image: null` or `image: ''` restores `content`. Removing a local `image` option inherits the plugin image, if configured. Loaded images are reused for size and layout changes.

Cross-origin servers must allow canvas use with appropriate CORS response headers. The default `crossOrigin: 'anonymous'` sends a CORS request without cross-origin credentials; use `'use-credentials'` only when the image server supports credentialed CORS. Set `null` to omit the CORS attribute. This does not bypass canvas security: an image that taints the canvas cannot be exported.

| Event   | Payload                                             | When it fires                                                                                                                                  |
| ------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `load`  | `WatermarkImageLoadEvent`: `{ src, width, height }` | After a newly loaded image is drawn successfully. Dimensions are the intrinsic image dimensions. Placement and size updates do not re-emit it. |
| `error` | `WatermarkImageErrorEvent`: `{ src, error }`        | When loading, image sizing, drawing, or canvas export fails. The watermark is cleared and slot content remains available.                      |

The playground includes repeating-logo and corner-logo presets, an image URL field, local image selection, CORS controls, and copyable Vue examples. Local files are previewed with object URLs and are not uploaded; applications should revoke object URLs they create when those URLs are no longer needed.

### Visibility and text layout

```ts
const options: WatermarkOptions = {
  content: ['Confidential', 'Review copy', 'Internal use only'],
  opacity: 0.6,
  disabled: false,
  font: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'left',
    color: '#334155',
  },
}
```

`opacity` affects only the watermark overlay, for both text and images; slot content stays unchanged. It multiplies the text color's alpha or image transparency. Its default is `1`, numeric values are clamped to `[0, 1]`, and non-finite values fall back to `1`. Changing opacity reuses the existing canvas image. An opacity of `0` hides the overlay visually but still allows loading and drawing.

`disabled: true` hides the overlay and suspends canvas drawing and new image loads while preserving the slot and wrapper layout. Pending image handlers are detached and late callbacks are ignored; an already-started network request may still finish. Re-enabling renders the latest options and reloads the current image, if any, so image load/error events can fire again. Disabled options work with SSR and plugin defaults.

`font.lineHeight` is the distance between line starts in **CSS pixels**, not a multiplier. `null` uses `fontSize + 3`, preserving the default spacing. Zero, negative, and non-finite values also fall back to automatic spacing. Set `null` locally to reset an inherited line height. Each array entry in `content` represents one line.

`font.textAlign` accepts `'left'`, `'center'`, or `'right'` and aligns lines within the text layout box before rotation. Its default is `'center'`. Automatic width uses the longest line; an explicit `width` provides a wider or narrower alignment box. Line height and text alignment do not affect images.

The playground's **Multiline text** preset demonstrates these options. You can edit one line per row, adjust opacity, disable the watermark, and change spacing or alignment.

### Server-side rendering

`Watermark` can render on the server, including in Nuxt. Slot content and an empty overlay are rendered first; the watermark is drawn after the component mounts in the browser. The initial server and client markup match for hydration.

Text, font, size, rotation, repetition, and gap changes redraw the watermark. Position, offset, z-index, and opacity changes reuse the existing image. When no image is set, empty text or an empty content array clears the overlay.

## Options

These are the built-in defaults, before plugin or component overrides. All dimensions and spacing use CSS pixels; the canvas bitmap is scaled for the device pixel ratio when drawn.

| Property      | Type                                       | Default       | Behavior                                                                                          |
| ------------- | ------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------- |
| `width`       | `number \| null`                           | `null`        | Text layout width, or maximum image width. `null` measures text or uses automatic image sizing.   |
| `height`      | `number \| null`                           | `null`        | Text layout height, or maximum image height. `null` measures text or uses automatic image sizing. |
| `content`     | `string \| string[] \| null`               | `null`        | One text string or an array of lines. Ignored while an image is set.                              |
| `image`       | `string \| null`                           | `null`        | Image URL; takes priority over text. `null` or `''` disables an inherited image.                  |
| `crossOrigin` | `'anonymous' \| 'use-credentials' \| null` | `'anonymous'` | CORS mode set before requesting the image. `null` omits the attribute.                            |
| `gap`         | `[number, number]`                         | `[20, 20]`    | Horizontal and vertical spacing. The tile includes half the gap on each side.                     |
| `offset`      | `[number \| null, number \| null]`         | `[0, 0]`      | Horizontal and vertical tile offsets. A `null` entry means zero.                                  |
| `position`    | `WatermarkPosition`                        | `'top-left'`  | Anchor for a single watermark. Ignored when `repeat` is `true`.                                   |
| `zIndex`      | `number`                                   | `5`           | Overlay stacking order.                                                                           |
| `rotate`      | `number`                                   | `-20`         | Rotation in degrees. Values are not clamped to `[-180, 180]`.                                     |
| `repeat`      | `boolean`                                  | `true`        | Draw staggered repeating tiles; `false` draws one watermark.                                      |
| `opacity`     | `number`                                   | `1`           | Overlay opacity, clamped to `[0, 1]`. Multiplies text/image alpha; does not fade slot content.    |
| `disabled`    | `boolean`                                  | `false`       | Hide the watermark and suspend drawing/image loading.                                             |
| `font`        | `WatermarkFont`                            | See below     | Text styling, merged field by field. Does not style images.                                       |

For text, automatic width measures the longest line using the selected font. Automatic height is `fontSize + lineHeight × (lineCount - 1)`, where automatic line height is `fontSize + 3`. Explicit text dimensions define the layout box; they do not wrap or scale text. Image dimensions preserve the original aspect ratio as described above. Use positive dimensions and font sizes.

`WatermarkPosition` accepts these nine values:

| Left            | Middle            | Right            |
| --------------- | ----------------- | ---------------- |
| `'top-left'`    | `'top-middle'`    | `'top-right'`    |
| `'middle-left'` | `'center'`        | `'middle-right'` |
| `'bottom-left'` | `'bottom-middle'` | `'bottom-right'` |

For a non-repeating watermark, positive offsets move inward from left/top/right/bottom anchors; middle/center offsets move right/down from the centered position. Offsets position the tile, including its gap padding. With repetition enabled, positive offsets inset the overlay from the left/top edges, and negative offsets shift the background pattern.

### Font options

| Property     | Type                                                       | Default                            |
| ------------ | ---------------------------------------------------------- | ---------------------------------- |
| `color`      | `string`                                                   | `'rgba(0,0,0,.2)'`                 |
| `fontSize`   | `number` or numeric string                                 | `18`                               |
| `fontWeight` | `'normal'`, `'bold'`, or numeric weight as a number/string | `'normal'`                         |
| `fontStyle`  | `'normal' \| 'italic' \| 'oblique'`                        | `'normal'`                         |
| `fontFamily` | `string`                                                   | `'sans-serif'`                     |
| `lineHeight` | `number \| null`                                           | `null` (automatic: `fontSize + 3`) |
| `textAlign`  | `'left' \| 'center' \| 'right'`                            | `'center'`                         |

`fontSize` is measured in pixels: `18` and `'18'` are supported; `'18px'` and other CSS lengths are not. Numeric weights should be in the CSS range 1–1000, such as `300`, `700`, or `'700'`. `fontFamily` accepts a CSS family name or fallback list.

Earlier types incorrectly accepted `fontWeight: 'light'`/`'weight'` and `fontStyle: 'none'`. Use a numeric weight such as `300`, `'bold'`, and `'normal'`, respectively. Earlier docs used `family`, `size`, `style`, and `weight`; the actual keys are `fontFamily`, `fontSize`, `fontStyle`, and `fontWeight`.

### TypeScript exports

The package exports the named `Watermark` component and the default plugin factory, plus `WatermarkOptions`, `WatermarkFont`, `WatermarkPosition`, `WatermarkImageLoadEvent`, and `WatermarkImageErrorEvent` types. `WatermarkDrawingParams` is a deprecated legacy type retained for compatibility; it is not a component option.

## License

`@watermarkify/vue-watermark` is licensed under the MIT License. See the [LICENSE file](./LICENSE) for more information.

## Contributing

Contributions are welcome! To contribute to `@watermarkify/vue-watermark`, please fork the repository and submit a pull request.
