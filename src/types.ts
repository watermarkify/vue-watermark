export interface WatermarkOptions {
  /**
     * The width of the watermark in pixels.
     */
  width?: number

  /**
     * The height of the watermark in pixels.
     */
  height?: number

  /**
     * The URL or path to the image file to be used as the watermark.
     */
  image?: string

  /**
     * The text content to be used as the watermark.
     * It can be a single string or an array of strings to display multiple lines of text.
     */
  content?: string | string[]

  /**
     * The gap between each instance of the watermark in pixels.
     * It is specified as a tuple where the first element represents the horizontal gap and
     * the second element represents the vertical gap.
     */
  gap?: [number, number]

  /**
     * The offset of the watermark from the top-left corner of the container element.
     * It is specified as a tuple where the first element represents the horizontal offset and
     * the second element represents the vertical offset.
     */
  offset?: [number, number]

  /**
     * The z-index of the watermark relative to other elements on the page.
     * A higher value means the watermark will appear on top of other elements with lower z-index values.
     */
  zIndex?: number
}
