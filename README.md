# @watermarkify/vue-watermark

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
```

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { Watermark } from '@watermarkify/vue-watermark'

const watermarkOptions = ref({
    content: 'watermark',
  },
)
</script>

<template>
  <div>
    <h1>Watermark Example</h1>
    <Watermark :options="watermarkOptions">
      <div class="content">This is the content of the slot.</div>
    </Watermark>
  </div>
</template>
```

## Options

| Property | Description                                                                                                                                                                | Type               | Default Value                                                                                  |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|------------------------------------------------------------------------------------------------|
| width    | The width of the watermark in pixels. If not specified, defaults to the width of the container element.                                                                    | number             | 120                                                                                            |
| height   | The height of the watermark in pixels. If not specified, defaults to the height of the container element.                                                                  | number             | 64                                                                                             |
| content  | The text content to be used as the watermark. Can be a string or an array of strings. If image is provided, this property will be ignored.                                 | string or string[] | undefined                                                                                      |
| gap      | The gap between each instance of the watermark in pixels. Can be an array with two values for horizontal and vertical gap, respectively.                                   | [number, number]   | [20, 20]                                                                                       |
| offset   | The offset of the watermark from the top-left corner of the container element in pixels. Can be an array with two values for horizontal and vertical offset, respectively. | [number, number]   | [gap[0]/2, gap[1]/2]                                                                           |
| zIndex   | The z-index of the watermark relative to other elements on the page.                                                                                                       | number             | 5                                                                                              |
| rotate   | The rotation angle in degrees of the watermark. Can be a value in the range [-180, 180].                                                                                   | number             | -20                                                                                            |
| font     | The font properties for the watermark text, including family, size, style, weight, and color.                                                                              | WatermarkFont      | { family: "sans-serif", size: 18, style: "normal", weight: "normal", color: "rgba(0,0,0,.2)" } |

<!-- | image    | The URL or path to the image file to be used as the watermark. If an image is provided, the content property will be ignored.                                              | string             | undefined                                                                                      | -->

## License

`@watermarkify/vue-watermark` is licensed under the MIT License. See the [LICENSE file](./LICENSE) for more information.

## Contributing

Contributions are welcome! To contribute to `@watermarkify/vue-watermark`, please fork the repository and submit a pull request.