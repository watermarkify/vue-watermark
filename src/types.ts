export interface WatermarkFont {
  /** Canvas text color. Default: 'rgba(0,0,0,.2)'. */
  color?: string
  /** Positive font size in pixels, as a number or numeric string (e.g. '18', not '18px'). Default: 18. */
  fontSize?: number | `${number}`
  /** CSS font weight: normal, bold, or a numeric weight (1–1000). Default: 'normal'. */
  fontWeight?: 'normal' | 'bold' | number | `${number}`
  /** Canvas font style. Default: 'normal'. */
  fontStyle?: 'normal' | 'italic' | 'oblique'
  /** CSS font family or fallback list. Default: 'sans-serif'. */
  fontFamily?: string
  /** Distance between text line starts in CSS pixels. null uses fontSize + 3. Default: null. */
  lineHeight?: number | null
  /** Horizontal alignment within the text layout width. Default: 'center'. */
  textAlign?: 'left' | 'center' | 'right'
}

export type WatermarkPosition =
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-middle'
  | 'bottom-right'

/** Options inherit from plugin defaults when omitted or undefined. Font fields merge individually. */
export interface WatermarkOptions {
  /** Text layout width or maximum image width in pixels. null selects automatic sizing. Default: null. */
  width?: number | null
  /** Text layout height or maximum image height in pixels. null selects automatic sizing. Default: null. */
  height?: number | null
  /** Image URL, taking priority over content. null or '' disables an inherited image. Default: null. */
  image?: string | null
  /** Image CORS mode, set before the request. null omits the attribute. Default: 'anonymous'. */
  crossOrigin?: 'anonymous' | 'use-credentials' | null
  /** Text lines. null, '', or [] clears text. Ignored while an image is set. Default: null. */
  content?: string | string[] | null
  /** Horizontal and vertical spacing in CSS pixels. Arrays replace inherited values. Default: [20, 20]. */
  gap?: [number, number]
  /** Horizontal and vertical offsets in CSS pixels; null entries mean zero. Default: [0, 0]. */
  offset?: [number | null, number | null]
  /** Anchor for a non-repeating watermark. Ignored when repeat is true. Default: 'top-left'. */
  position?: WatermarkPosition
  /** Overlay stacking order. Default: 5. */
  zIndex?: number
  /** Overlay opacity, clamped to [0, 1]. Multiplies text/image alpha. Default: 1. */
  opacity?: number
  /** Hide the overlay and suspend drawing/image loading. Slot content remains visible. Default: false. */
  disabled?: boolean
  /** Rotation in degrees; values are not clamped. Default: -20. */
  rotate?: number
  /** Draw staggered repeating tiles, or one watermark when false. Default: true. */
  repeat?: boolean
  /** Text styling. Each omitted or undefined field inherits its default. Ignored for image drawing. */
  font?: WatermarkFont
}

/** Emitted after a newly loaded image is drawn successfully. */
export interface WatermarkImageLoadEvent {
  src: string
  /** Intrinsic image width, before scaling. */
  width: number
  /** Intrinsic image height, before scaling. */
  height: number
}

/** Emitted when image loading, sizing, drawing, or canvas export fails. */
export interface WatermarkImageErrorEvent {
  src: string
  error: Error
}

/** @deprecated Legacy drawing coordinates retained for compatibility; not a component option. */
export interface WatermarkDrawingParams {
  drawX: number
  drawY: number
  rotateX: number
  rotateY: number
}
