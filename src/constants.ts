import type { InjectionKey } from 'vue'
import type { WatermarkOptions } from './types'

export const InjectionOptions: InjectionKey<WatermarkOptions> = Symbol('vue-watermark-options')
export const FontGap = 3
export const BaseSize = 2
