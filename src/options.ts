import type { WatermarkFont, WatermarkOptions } from './types'

type ResolvedWatermarkOptions = Required<Omit<WatermarkOptions, 'font'>> & { font: Required<WatermarkFont> }

export const defaultOptions: ResolvedWatermarkOptions = {
  width: null,
  height: null,
  content: null,
  image: null,
  crossOrigin: 'anonymous',
  gap: [20, 20],
  offset: [0, 0],
  position: 'top-left',
  zIndex: 5,
  opacity: 1,
  disabled: false,
  rotate: -20,
  repeat: true,
  font: {
    color: 'rgba(0,0,0,.2)',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'sans-serif',
    lineHeight: null,
    textAlign: 'center',
  },
}

function definedOptions<T extends object>(options: T): Partial<T> {
  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined)) as Partial<T>
}

export function resolveOptions(pluginOptions: WatermarkOptions, instanceOptions: WatermarkOptions): ResolvedWatermarkOptions {
  return {
    ...defaultOptions,
    ...definedOptions(pluginOptions),
    ...definedOptions(instanceOptions),
    font: {
      ...defaultOptions.font,
      ...definedOptions(pluginOptions.font ?? {}),
      ...definedOptions(instanceOptions.font ?? {}),
    },
  }
}
