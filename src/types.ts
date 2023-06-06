export interface WatermarkFont {
  color?: string // Color of the watermark text
  fontSize?: number | string // Font size of the watermark text
  fontWeight?: 'normal' | 'light' | 'weight' | number // Font weight of the watermark text
  fontStyle?: 'none' | 'normal' | 'italic' | 'oblique' // Font style of the watermark text
  fontFamily?: string // Font family of the watermark text
}

export interface WatermarkOptions {
  width?: number // The width of the watermark in pixels.
  height?: number // The height of the watermark in pixels.
  image?: string // The URL or path to the image file to be used as the watermark.
  content?: string | string[] // The text content to be used as the watermark.
  gap?: [number, number] // The gap between each instance of the watermark in pixels.
  offset?: [number, number] // The offset of the watermark from the top-left corner of the container element.
  zIndex?: number // The z-index of the watermark relative to other elements on the page.
  rotate: number // The rotation angle in degree ∈ [-180 .. 180]
  font?: WatermarkFont // The font properties for the watermark text.
}

export interface WatermarkDrawingParams {
  drawX: number // The X position where the watermark should be drawn on the canvas.
  drawY: number // The Y position where the watermark should be drawn on the canvas.
  rotateX: number // The X position around which the watermark should be rotated.
  rotateY: number // The Y position around which the watermark should be rotated.
}
