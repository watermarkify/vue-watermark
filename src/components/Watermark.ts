import { defineComponent, h } from 'vue'
import type { WatermarkOptions } from '../types'

export const Watermark = defineComponent({
  name: 'Watermark',
  props: {
    options: {
      type: Object as () => WatermarkOptions,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    // TODO
  },
})
