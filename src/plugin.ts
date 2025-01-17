import type { Plugin } from 'vue'
import type { WatermarkOptions } from './types'
import { Watermark } from './components/Watermark'
import { InjectionOptions } from './constants'

export function WatermarkPlugin(defaultOptions: WatermarkOptions = {}): Plugin {
  return {
    // TODO: better type
    install(app: any) {
      app.provide(InjectionOptions, defaultOptions)
      app.component('Watermark', Watermark)
    },
  }
}
