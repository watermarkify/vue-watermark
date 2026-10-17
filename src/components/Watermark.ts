import type { CSSProperties, PropType } from 'vue'
import type { WatermarkImageErrorEvent, WatermarkImageLoadEvent, WatermarkOptions } from '../types'
import { computed, defineComponent, h, inject, onMounted, shallowRef, watch } from 'vue'
import { BaseSize, FontGap, InjectionOptions } from '../constants'
import { resolveOptions } from '../options'

export const Watermark = defineComponent({
  name: 'Watermark',
  emits: {
    load: (_event: WatermarkImageLoadEvent) => true,
    error: (_event: WatermarkImageErrorEvent) => true,
  },
  props: {
    options: {
      type: Object as PropType<WatermarkOptions>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    const pluginOptions = inject(InjectionOptions, {})
    const options = computed(() => resolveOptions(pluginOptions, props.options))
    const tile = shallowRef<{ url: string; width: number }>()
    let loadedImage: HTMLImageElement | undefined

    const reportImageError = (src: string, error: unknown) => {
      tile.value = undefined
      ctx.emit('error', { src, error: error instanceof Error ? error : new Error(String(error)) })
    }

    const overlayStyle = computed<CSSProperties>(() => {
      const { zIndex, repeat, offset, position, opacity, disabled } = options.value
      const offsetX = offset?.[0] ?? 0
      const offsetY = offset?.[1] ?? 0
      const style: CSSProperties = {
        zIndex,
        opacity: Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 1,
        display: disabled ? 'none' : undefined,
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        backgroundRepeat: repeat ? 'repeat' : 'no-repeat',
        backgroundImage: tile.value ? `url('${tile.value.url}')` : undefined,
        backgroundSize: tile.value ? `${tile.value.width}px` : undefined,
      }

      if (!repeat) {
        const x = position.endsWith('-right')
          ? `calc(100% - ${offsetX}px)`
          : position.endsWith('-middle') || position === 'center'
            ? `calc(50% + ${offsetX}px)`
            : `${offsetX}px`
        const y = position.startsWith('bottom-')
          ? `calc(100% - ${offsetY}px)`
          : position.startsWith('middle-') || position === 'center'
            ? `calc(50% + ${offsetY}px)`
            : `${offsetY}px`
        style.backgroundPosition = `${x} ${y}`
      } else {
        if (offsetX > 0) {
          style.left = `${offsetX}px`
          style.width = `calc(100% - ${offsetX}px)`
        }
        if (offsetY > 0) {
          style.top = `${offsetY}px`
          style.height = `calc(100% - ${offsetY}px)`
        }
        style.backgroundPosition = `${Math.min(offsetX, 0)}px ${Math.min(offsetY, 0)}px`
      }
      return style
    })

    const renderTile = () => {
      const { content, image, width, height, gap, rotate, repeat, font, disabled } = options.value
      const contents = Array.isArray(content) ? content : [content ?? '']
      if (disabled || (image ? !loadedImage : !contents.some((line) => line.length > 0))) {
        tile.value = undefined
        return false
      }

      const canvas = document.createElement('canvas')
      const canvasCtx = canvas.getContext('2d')
      if (!canvasCtx) {
        tile.value = undefined
        if (image) {
          throw new Error('@watermarkify: Canvas 2D context is unavailable')
        }
        return false
      }

      const ratio = window.devicePixelRatio || 1
      const fontSize = Number(font.fontSize)
      const lineHeight =
        font.lineHeight != null && Number.isFinite(font.lineHeight) && font.lineHeight > 0 ? font.lineHeight : fontSize + FontGap
      const getFont = (size: number) => `${font.fontStyle} ${font.fontWeight} ${size}px ${font.fontFamily}`
      canvasCtx.font = getFont(fontSize)
      let watermarkWidth: number
      let watermarkHeight: number
      if (image && loadedImage) {
        const { naturalWidth, naturalHeight } = loadedImage
        const fit =
          width == null && height == null
            ? 1
            : Math.min(width == null ? Infinity : width / naturalWidth, height == null ? Infinity : height / naturalHeight)
        watermarkWidth = naturalWidth * fit
        watermarkHeight = naturalHeight * fit
      } else {
        watermarkWidth = width ?? Math.ceil(Math.max(...contents.map((line) => canvasCtx.measureText(line).width)))
        watermarkHeight = height ?? fontSize + (contents.length - 1) * lineHeight
      }
      const [gapX, gapY] = gap
      const radians = (Math.PI / 180) * rotate
      const rotatedWidth = Math.abs(watermarkWidth * Math.cos(radians)) + Math.abs(watermarkHeight * Math.sin(radians))
      const rotatedHeight = Math.abs(watermarkWidth * Math.sin(radians)) + Math.abs(watermarkHeight * Math.cos(radians))
      // A single watermark needs one cell; repeating watermarks use a staggered pair.
      const scale = repeat ? BaseSize : 1
      const cellWidth = gapX + rotatedWidth
      const cellHeight = gapY + rotatedHeight
      const dimensions = [watermarkWidth, watermarkHeight, cellWidth, cellHeight, image ? 1 : fontSize]
      if (!dimensions.every((value) => Number.isFinite(value) && value > 0)) {
        tile.value = undefined
        if (image) {
          throw new Error('@watermarkify: Image watermark dimensions must be positive and finite')
        }
        return false
      }
      canvas.width = Math.ceil(cellWidth * ratio * scale)
      canvas.height = Math.ceil(cellHeight * ratio * scale)

      // Resizing a canvas resets its drawing state, including the font.
      canvasCtx.font = getFont(fontSize * ratio)
      canvasCtx.fillStyle = font.color
      canvasCtx.textAlign = font.textAlign
      canvasCtx.textBaseline = 'top'
      const drawCell = (column: number, row: number) => {
        const centerX = cellWidth * ratio * (column + 0.5)
        const centerY = cellHeight * ratio * (row + 0.5)
        canvasCtx.save()
        canvasCtx.translate(centerX, centerY)
        canvasCtx.rotate(radians)
        canvasCtx.translate(-centerX, -centerY)
        if (image && loadedImage) {
          canvasCtx.drawImage(
            loadedImage,
            centerX - (watermarkWidth * ratio) / 2,
            centerY - (watermarkHeight * ratio) / 2,
            watermarkWidth * ratio,
            watermarkHeight * ratio,
          )
        } else {
          const x = centerX + ((font.textAlign === 'left' ? -1 : font.textAlign === 'right' ? 1 : 0) * watermarkWidth * ratio) / 2
          contents.forEach((line, index) => {
            const y = centerY - (watermarkHeight * ratio) / 2 + index * lineHeight * ratio
            canvasCtx.fillText(line, x, y)
          })
        }
        canvasCtx.restore()
      }
      drawCell(0, 0)
      if (repeat) {
        drawCell(1, 1)
      }
      tile.value = { url: canvas.toDataURL(), width: cellWidth * scale }
      return true
    }

    const drawWatermark = () => {
      try {
        return renderTile()
      } catch (error) {
        tile.value = undefined
        if (options.value.image) {
          reportImageError(options.value.image, error)
        }
        return false
      }
    }

    onMounted(() => {
      watch(
        [() => (options.value.disabled ? null : options.value.image), () => options.value.crossOrigin],
        ([src, crossOrigin], _previous, onCleanup) => {
          loadedImage = undefined
          if (!src) {
            return
          }
          tile.value = undefined

          const element = new Image()
          let cancelled = false
          const isCurrent = () =>
            !cancelled && !options.value.disabled && options.value.image === src && options.value.crossOrigin === crossOrigin
          onCleanup(() => {
            cancelled = true
            element.onload = null
            element.onerror = null
            loadedImage = undefined
          })
          element.onload = () => {
            if (!isCurrent()) {
              return
            }
            if (!element.naturalWidth || !element.naturalHeight) {
              reportImageError(src, new Error('@watermarkify: Image has no intrinsic dimensions'))
              return
            }
            loadedImage = element
            if (drawWatermark()) {
              ctx.emit('load', { src, width: element.naturalWidth, height: element.naturalHeight })
            }
          }
          element.onerror = () => {
            if (isCurrent()) {
              reportImageError(src, new Error('@watermarkify: Unable to load watermark image; check the URL and CORS headers'))
            }
          }
          // Set CORS before src so it applies to the initial request.
          element.crossOrigin = crossOrigin
          element.src = src
        },
        { immediate: true, flush: 'post' },
      )
      // Browser work starts after mount (and hydration). Watch individual drawing
      // inputs so placement-only changes and slot updates reuse the canvas image.
      watch(
        [
          // Compare line values so in-place array edits redraw without making
          // unrelated option changes trigger a deep watcher callback.
          () => JSON.stringify(options.value.content),
          () => options.value.image,
          () => options.value.disabled,
          () => options.value.width,
          () => options.value.height,
          () => options.value.gap[0],
          () => options.value.gap[1],
          () => options.value.rotate,
          () => options.value.repeat,
          () => options.value.font.fontSize,
          () => options.value.font.fontFamily,
          () => options.value.font.fontStyle,
          () => options.value.font.fontWeight,
          () => options.value.font.color,
          () => (options.value.image ? null : options.value.font.lineHeight),
          () => (options.value.image ? null : options.value.font.textAlign),
        ],
        drawWatermark,
        { immediate: true, flush: 'post' },
      )
    })

    return () => {
      const slots = ctx.slots.default?.()
      if (!slots) {
        throw new Error('@watermarkify: Slot is required to use <Watermark>')
      }
      if (slots.length !== 1) {
        throw new Error(`@watermarkify: <Watermark> requires exactly one slot, but got ${slots.length}`)
      }

      return h('div', {}, [
        h('div', { style: { position: 'relative' } }, [
          slots[0],
          h('div', { 'aria-hidden': 'true', 'style': overlayStyle.value }),
        ]),
      ])
    }
  },
})
