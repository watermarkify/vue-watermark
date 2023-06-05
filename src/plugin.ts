import type { Plugin } from 'vue'
import { Watermark } from './components/Watermark'
import { InjectionOptions } from './constants'
import type { WatermarkOptions } from './types'

export function WatermarkPlugin(defaultOptions: WatermarkOptions = {}): Plugin {
  return {
    install(app) {
      app.provide(InjectionOptions, defaultOptions)
      app.component('Watermark', Watermark)
    },
  }
}
