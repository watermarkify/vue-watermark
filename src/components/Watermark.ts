import type { PropType } from 'vue'
import type { WatermarkDrawingParams, WatermarkOptions } from '../types'
import { defineComponent, h, reactive, ref, toRefs, watch } from 'vue'
import { BaseSize, FontGap } from '../constants'
import { defaultOptions } from '../options'

export const Watermark = defineComponent({
  name: 'Watermark',
  props: {
    options: {
      type: Object as PropType<WatermarkOptions>,
      default: {},
    },
  },
  setup(props, ctx) {
    // Merge props.options with defaultOptions
    const options = reactive({
      ...defaultOptions,
      ...props.options,
      font: {
        ...defaultOptions.font,
        ...props.options?.font,
      },
    })

    // Retrieve the necessary props
    const { width, height, content, gap, offset, image, zIndex, rotate } = toRefs(options)

    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
    const devicePixelRatio = window.devicePixelRatio || 1

    // Calculate gap and offset values
    const [gapX, gapY] = toRefs(gap.value)
    const [gapXCenter, gapYCenter] = [gapX.value / 2, gapY.value / 2]
    // Create ref for watermark container and watermark element
    const watermarkContainerRef = ref<HTMLDivElement>()
    const watermarkRef = ref<HTMLDivElement>()

    const appendPixel = (num: number): string => {
      // Convert the number to a string with 'px' appended
      return `${num}px`
    }

    // Calculate watermark size based on content and font properties
    const getWatermarkSize = (canvasCtx: CanvasRenderingContext2D) => {
      // Destructure font props
      const { fontSize, fontFamily } = options.font
      // Set default dimensions for the watermark
      let [defaultWidth, defaultHeight] = [120, 64]
      // If no image is provided and canvas text measurement is available
      if (!image && canvasCtx.measureText) {
        // Set the font and content to be measured
        canvasCtx.font = `${Number(fontSize)}px ${fontFamily}`
        const contents = Array.isArray(content.value) ? content.value : [content.value]
        // Measure the width of each content item
        const widths = contents.map((item) => canvasCtx.measureText(item!).width)
        // Calculate the default width and height based on the measured content
        defaultWidth = Math.ceil(Math.max(...widths))
        defaultHeight = Number(fontSize) * contents.length + (contents.length - 1) * FontGap
      }
      // Return the dimensions as a tuple
      return [width.value ?? defaultWidth, height.value ?? defaultHeight] as const
    }

    // Draw texts at the specified coordinates,
    // filling the string's characters with the current fillStyle
    const fillTexts = (
      canvasCtx: CanvasRenderingContext2D,
      drawX: number,
      drawY: number,
      drawWidth: number,
      drawHeight: number,
    ) => {
      // Destructure font props
      const { fontSize, fontFamily, fontStyle, color, fontWeight } = options.font
      // Set mergedFontSize
      const mergedFontSize = Number(fontSize) * devicePixelRatio
      // Set the font properties for drawing the text
      // For instance props, see below link
      // Ref: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
      canvasCtx.font = `${fontStyle} normal ${fontWeight} ${appendPixel(mergedFontSize)}/${appendPixel(drawHeight)} ${fontFamily}`
      canvasCtx.fillStyle = color!
      canvasCtx.textAlign = 'center'
      canvasCtx.textBaseline = 'top'
      // Translate the canvas context to the center of the text area
      canvasCtx.translate(drawWidth / 2, 0)
      const contents = Array.isArray(content.value) ? content.value : [content.value]
      contents?.forEach((item, index) => {
        // Calculate the Y position for each line of text
        drawY += index * (mergedFontSize + FontGap * devicePixelRatio)
        // Draw the text on the canvas
        canvasCtx.fillText(item ?? '', drawX, drawY)
      })
    }

    const convertStyleToString = (style: Record<string, any>): string => {
      // Convert the style object to a string of CSS styles
      // e.g. { z-index: 5; position: absolute; } -> z-index: 5; position: absolute;
      return Object.keys(style)
        .map((key: string) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${style[key]};`)
        .join(' ')
    }

    const getWatermarkStyle = () => {
      // Set default styles for the watermark
      const watermarkStyle = {
        zIndex: zIndex.value,
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'unset',
      }
      // Calculate the watermark position based on the options
      let positionLeft = offset.value?.[0] ?? gapXCenter - gapXCenter
      let positionTop = offset.value?.[1] ?? gapYCenter - gapYCenter
      // If the watermark goes beyond the left or top edge of the canvas
      if (positionLeft > 0) {
        // Adjust the left position and width accordingly
        watermarkStyle.left = `${appendPixel(positionLeft)}`
        watermarkStyle.width = `calc(100% - ${appendPixel(positionLeft)})`
        positionLeft = 0
      }
      if (positionTop > 0) {
        // Adjust the top position and height accordingly
        watermarkStyle.top = `${appendPixel(positionTop)}`
        watermarkStyle.height = `calc(100% - ${appendPixel(positionTop)})`
        positionTop = 0
      }
      // Set the background position based on the calculated position
      watermarkStyle.backgroundPosition = `${appendPixel(positionLeft)} ${appendPixel(positionTop)}`
      return watermarkStyle
    }

    const addWatermark = (base64Url: string, watermarkWidth: number) => {
      if (watermarkContainerRef.value && watermarkRef.value) {
        // Add watermark style
        watermarkRef.value.setAttribute(
          'style',
          convertStyleToString({
            ...getWatermarkStyle(), // Get the style for the watermark
            backgroundImage: `url('${base64Url}')`, // Set the image as the background
            backgroundSize: `${appendPixel((gapX.value + watermarkWidth) * BaseSize)}`, // Set the background size
          }),
        )
        // Add the watermark element to the container
        watermarkContainerRef.value.append(watermarkRef.value)
      }
    }

    const rotateWatermark = (canvasCtx: CanvasRenderingContext2D, rotateX: number, rotateY: number, rotate: number) => {
      // Translate the canvas to the rotation origin
      canvasCtx.translate(rotateX, rotateY)
      // Rotate the canvas by the specified angle
      canvasCtx.rotate((Math.PI / 180) * Number(rotate))
      // Translate the canvas back to its original position
      canvasCtx.translate(-rotateX, -rotateY)
    }

    const drawText = (
      canvas: HTMLCanvasElement,
      canvasCtx: CanvasRenderingContext2D,
      drawWidth: number,
      drawHeight: number,
      watermarkWidth: number,
      drawingParams: WatermarkDrawingParams,
      alternateDrawingParams: WatermarkDrawingParams,
    ) => {
      // Draw the primary text using the provided drawing parameters
      fillTexts(canvasCtx, drawingParams.drawX, drawingParams.drawY, drawWidth, drawHeight)
      // Restore the canvas to its original state
      canvasCtx.restore()
      // Rotate the canvas using the alternate drawing parameters
      rotateWatermark(canvasCtx, alternateDrawingParams.rotateX, alternateDrawingParams.rotateY, rotate.value)
      // Draw the secondary text using the alternate drawing parameters
      fillTexts(canvasCtx, alternateDrawingParams.drawX, alternateDrawingParams.drawY, drawWidth, drawHeight)
      // Add the watermark to the canvas
      addWatermark(canvas.toDataURL(), watermarkWidth)
    }

    watch(
      () => props.options,
      () => {
        Object.assign(options, {
          ...defaultOptions,
          ...props.options,
          font: {
            ...defaultOptions.font,
            ...props.options?.font,
          },
        })
      },
      { deep: true, immediate: true },
    )

    // Render the watermark overlay
    return () => {
      // Get the default slot content
      const slots = ctx.slots.default?.()
      // Throw an error if no slot content is provided
      if (!slots) throw new Error('@watermarkify: Slot is required to use <Watermark>')
      // Throw an error if more than one slot content is provided
      if (slots.length !== 1) throw new Error(`@watermarkify: <Watermark> requires exactly one slot, but got ${slots.length}`)

      const renderWatermark = () => {
        const slot = slots[0]
        // Create a new canvas element and get its context
        const canvas = document.createElement('canvas')
        const canvasCtx = canvas.getContext('2d')
        if (canvasCtx) {
          // Create a new div element for the watermark if it doesn't exist yet
          if (!watermarkRef.value) watermarkRef.value = document.createElement('div')
          // Get the watermark size and canvas dimensions
          const [watermarkWidth, watermarkHeight] = getWatermarkSize(canvasCtx)
          const canvasWidth = (gapX.value + watermarkWidth) * devicePixelRatio
          const canvasHeight = (gapY.value + watermarkHeight) * devicePixelRatio
          const drawWidth = watermarkWidth * devicePixelRatio
          const drawHeight = watermarkHeight * devicePixelRatio
          // Set the canvas dimensions
          canvas.setAttribute('width', `${appendPixel(canvasWidth * BaseSize)}`)
          canvas.setAttribute('height', `${appendPixel(canvasHeight * BaseSize)}`)
          // Set the drawing parameters
          const drawingParams = {
            drawX: (gapX.value * devicePixelRatio) / 2,
            drawY: (gapY.value * devicePixelRatio) / 2,
            rotateX: (drawWidth + gapX.value * devicePixelRatio) / 2,
            rotateY: (drawHeight + gapY.value * devicePixelRatio) / 2,
          }
          // Set the alternate drawing parameters
          const alternateDrawingParams = {
            drawX: drawingParams.drawX + canvasWidth,
            drawY: drawingParams.drawY + canvasHeight,
            rotateX: drawingParams.rotateX + canvasWidth,
            rotateY: drawingParams.rotateY + canvasHeight,
          }
          // Save the canvas state
          canvasCtx.save()
          // Rotate the canvas
          rotateWatermark(canvasCtx, drawingParams.rotateX, drawingParams.rotateY, rotate.value)

          if (image.value) {
            // TODO: handle image watermark
          } else {
            // Draw the text watermark
            drawText(canvas, canvasCtx, drawWidth, drawHeight, watermarkWidth, drawingParams, alternateDrawingParams)
          }
        }
        // Return a div element containing the original content and the watermark container
        return h(
          'div',
          {
            ref: watermarkContainerRef,
            style: { position: 'relative' },
          },
          [slot],
        )
      }
      renderWatermark()

      return h('div', {}, renderWatermark())
    }
  },
})
