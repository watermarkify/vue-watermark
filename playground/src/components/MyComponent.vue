<script setup lang="ts">
import type {
  WatermarkFont,
  WatermarkImageErrorEvent,
  WatermarkImageLoadEvent,
  WatermarkOptions,
  WatermarkPosition,
} from '@watermarkify/vue-watermark'
import { Watermark } from '@watermarkify/vue-watermark'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const demoLogo = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/watermark-logo.svg`

const watermarkPositions: WatermarkPosition[] = [
  'top-left',
  'top-middle',
  'top-right',
  'middle-left',
  'center',
  'middle-right',
  'bottom-left',
  'bottom-middle',
  'bottom-right',
]

type PlaygroundOptions = Required<Omit<WatermarkOptions, 'width' | 'height' | 'image' | 'font'>> & {
  width: number | undefined
  height: number | undefined
  image: string | undefined
  font: Required<WatermarkFont>
}

const watermarkOptions = ref<PlaygroundOptions>({
  image: undefined,
  crossOrigin: 'anonymous',
  content: 'watermark',
  gap: [20, 20],
  offset: [10, 10],
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
  width: undefined,
  height: undefined,
})

const textContent = computed({
  get: () =>
    Array.isArray(watermarkOptions.value.content)
      ? watermarkOptions.value.content.join('\n')
      : (watermarkOptions.value.content ?? ''),
  set: (value: string) => {
    watermarkOptions.value.content = value.includes('\n') ? value.split('\n') : value
  },
})

function setLineHeight(event: Event) {
  const value = (event.target as HTMLInputElement).value
  watermarkOptions.value.font.lineHeight = value === '' ? null : Number(value)
}

const imageUrl = ref('')
const imageStatus = ref('Text watermark')
const imageFailed = ref(false)
const copyStatus = ref('')
let localImageUrl: string | undefined

function releaseLocalImage() {
  if (localImageUrl) {
    URL.revokeObjectURL(localImageUrl)
    localImageUrl = undefined
  }
}

function useExample(example: 'text' | 'multiline' | 'repeat' | 'corner') {
  releaseLocalImage()
  const isText = example === 'text' || example === 'multiline'
  watermarkOptions.value.disabled = false
  watermarkOptions.value.opacity = 1
  watermarkOptions.value.content = example === 'multiline' ? ['Confidential', 'Review copy', 'Internal use only'] : 'watermark'
  watermarkOptions.value.font.lineHeight = example === 'multiline' ? 32 : null
  watermarkOptions.value.font.textAlign = example === 'multiline' ? 'left' : 'center'
  watermarkOptions.value.image = isText ? undefined : demoLogo
  watermarkOptions.value.width = isText ? undefined : 160
  watermarkOptions.value.height = undefined
  watermarkOptions.value.rotate = example === 'corner' ? 0 : -20
  watermarkOptions.value.repeat = example !== 'corner'
  watermarkOptions.value.position = example === 'corner' ? 'bottom-right' : 'top-left'
  watermarkOptions.value.gap = [20, 20]
  watermarkOptions.value.offset = [10, 10]
  watermarkOptions.value.crossOrigin = 'anonymous'
  imageUrl.value = isText ? '' : demoLogo
}

function applyImageUrl() {
  releaseLocalImage()
  watermarkOptions.value.image = imageUrl.value.trim() || undefined
  watermarkOptions.value.width ??= 96
}

function selectImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }
  if (!file.type.startsWith('image/')) {
    imageStatus.value = 'Choose an image file.'
    imageFailed.value = true
    input.value = ''
    return
  }
  releaseLocalImage()
  localImageUrl = URL.createObjectURL(file)
  watermarkOptions.value.image = localImageUrl
  watermarkOptions.value.width ??= 96
  imageUrl.value = ''
  input.value = ''
}

function setDimension(key: 'width' | 'height', event: Event) {
  const value = (event.target as HTMLInputElement).value
  watermarkOptions.value[key] = value === '' ? undefined : Number(value)
}

watch(
  [() => watermarkOptions.value.image, () => watermarkOptions.value.crossOrigin],
  ([image]) => {
    imageStatus.value = image ? 'Loading image…' : 'Text watermark'
    imageFailed.value = false
  },
  { flush: 'sync' },
)

function imageLoaded(event: WatermarkImageLoadEvent) {
  imageStatus.value = `Image ready · ${event.width} × ${event.height} original pixels`
  imageFailed.value = false
}

function imageError(event: WatermarkImageErrorEvent) {
  imageStatus.value = event.error.message
  imageFailed.value = true
}

const exampleCode = computed(() => {
  const options = {
    ...watermarkOptions.value,
    image: localImageUrl
      ? './your-logo.png'
      : watermarkOptions.value.image === demoLogo
        ? './logo.svg'
        : watermarkOptions.value.image,
  }
  return (
    `<script setup lang="ts">\nimport type { WatermarkOptions } from '@watermarkify/vue-watermark'\nimport { Watermark } from '@watermarkify/vue-watermark'\n\nconst options: WatermarkOptions = ${JSON.stringify(options, null, 2)}\n</scr` +
    `ipt>\n\n<template>\n  <Watermark :options="options">\n    <div>Your content</div>\n  </Watermark>\n</template>`
  )
})

async function copyExample() {
  try {
    await navigator.clipboard.writeText(exampleCode.value)
    copyStatus.value = 'Copied'
  } catch {
    copyStatus.value = 'Select and copy the code below.'
  }
}

onBeforeUnmount(releaseLocalImage)
</script>

<template>
  <section class="image-controls" aria-label="Watermark examples">
    <div class="example-buttons">
      <strong>Try an example</strong>
      <button type="button" @click="useExample('text')">Text watermark</button>
      <button type="button" @click="useExample('multiline')">Multiline text</button>
      <button type="button" @click="useExample('repeat')">Repeating logo</button>
      <button type="button" @click="useExample('corner')">Corner logo</button>
    </div>
    <form class="image-inputs" @submit.prevent="applyImageUrl">
      <label class="url-field">
        Image URL
        <input class="form-control" v-model="imageUrl" type="text" placeholder="/logo.png or https://…" />
      </label>
      <button type="submit">Apply image</button>
      <label>
        Or choose a local image
        <input class="form-control" type="file" accept="image/*" @change="selectImage" />
      </label>
      <label>
        Image CORS mode
        <select v-model="watermarkOptions.crossOrigin" class="form-control">
          <option value="anonymous">Anonymous (default)</option>
          <option value="use-credentials">With credentials</option>
          <option :value="null">No CORS attribute</option>
        </select>
      </label>
    </form>
    <div class="visibility-controls">
      <div class="inline-control">
        <label for="opacity">Opacity · {{ watermarkOptions.opacity }}</label>
        <input id="opacity" v-model.number="watermarkOptions.opacity" type="range" min="0" max="1" step="0.05" />
      </div>
      <label for="disabled"><input id="disabled" v-model="watermarkOptions.disabled" type="checkbox" /> Disable watermark</label>
      <div class="inline-control">
        <label for="line-height">Line height (px)</label>
        <input
          id="line-height"
          class="form-control"
          :value="watermarkOptions.font.lineHeight"
          type="number"
          min="1"
          placeholder="Auto"
          :disabled="!!watermarkOptions.image"
          @input="setLineHeight"
        />
      </div>
      <div class="inline-control">
        <label for="text-align">Text alignment</label>
        <select
          class="form-control"
          id="text-align"
          v-model="watermarkOptions.font.textAlign"
          :disabled="!!watermarkOptions.image"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
    <p class="image-hint">
      Images take priority over text. Set one dimension to keep the original proportions; set both to fit inside a box. Local
      files stay in your browser.
    </p>
    <p role="status" :class="{ 'image-error': imageFailed }">
      {{ watermarkOptions.disabled ? 'Watermark disabled' : imageStatus }}
    </p>
  </section>
  <main class="flex flex-col lg:flex-row flex-1 items-stretch">
    <section class="flex flex-2 lg:flex-1 bg-watermarkify-500">
      <Watermark :options="watermarkOptions" class="watermark flex flex-1" @load="imageLoaded" @error="imageError">
        <div class="p-4 h-full">This is the content of the slot.</div>
      </Watermark>
    </section>

    <section class="flex-1 flex items-stretch">
      <div class="options-grid">
        <div class="full-width">
          <label for="content">content</label>
          <textarea id="content" v-model="textContent" class="form-control" rows="3" placeholder="One watermark line per row" />
        </div>
        <div>
          <label for="width">width</label>
          <input
            id="width"
            :value="watermarkOptions.width"
            min="1"
            class="form-control"
            type="number"
            placeholder="Enter width"
            @input="setDimension('width', $event)"
          />
        </div>
        <div>
          <label for="height">height</label>
          <input
            id="height"
            :value="watermarkOptions.height"
            min="1"
            class="form-control"
            type="number"
            placeholder="Enter height"
            @input="setDimension('height', $event)"
          />
        </div>
        <fieldset>
          <legend>Gap (X / Y)</legend>
          <div class="paired-inputs">
            <input
              id="gap_x"
              aria-label="Gap X"
              v-model="watermarkOptions.gap[0]"
              class="form-control"
              type="number"
              placeholder="Enter Gap X"
            />
            <input
              id="gap_y"
              aria-label="Gap Y"
              v-model="watermarkOptions.gap[1]"
              class="form-control"
              type="number"
              placeholder="Enter Gap Y"
            />
          </div>
        </fieldset>
        <fieldset>
          <legend>Offset (X / Y)</legend>
          <div class="paired-inputs">
            <input
              id="offset_x"
              aria-label="Offset X"
              v-model="watermarkOptions.offset[0]"
              class="form-control"
              type="number"
              placeholder="Enter offset X"
            />
            <input
              id="offset_y"
              aria-label="Offset Y"
              v-model="watermarkOptions.offset[1]"
              class="form-control"
              type="number"
              placeholder="Enter offset Y"
            />
          </div>
        </fieldset>
        <div>
          <label for="zIndex">zIndex</label>
          <input id="zIndex" v-model="watermarkOptions.zIndex" class="form-control" type="number" placeholder="Enter zIndex" />
        </div>
        <div>
          <label for="rotate">rotate</label>
          <input
            id="rotate"
            v-model="watermarkOptions.rotate"
            class="form-control"
            type="number"
            min="-180"
            max="180"
            placeholder="Enter rotate"
          />
        </div>
        <div>
          <label id="repeat-label" for="repeat">Repeat watermark</label>
          <label class="repeat-toggle">
            <input
              id="repeat"
              v-model="watermarkOptions.repeat"
              type="checkbox"
              role="switch"
              aria-labelledby="repeat-label"
              aria-describedby="repeat-description"
            />
            <span class="switch-track" aria-hidden="true" />
            <span aria-hidden="true">{{ watermarkOptions.repeat ? 'On' : 'Off' }}</span>
          </label>
          <p id="repeat-description" class="field-hint">Tile across the preview instead of showing one watermark.</p>
        </div>
        <div>
          <label for="position">position</label>
          <select id="position" v-model="watermarkOptions.position" class="form-control">
            <option v-for="watermarkPosition in watermarkPositions" :key="watermarkPosition" :value="watermarkPosition">
              {{ watermarkPosition }}
            </option>
          </select>
        </div>

        <div>
          <label for="color">fontColor</label>
          <input
            id="color"
            v-model="watermarkOptions.font.color"
            type="text"
            name="color"
            class="form-control"
            placeholder="Enter a color value"
          />
        </div>
        <div>
          <label for="size">fontSize</label>
          <input
            id="size"
            v-model="watermarkOptions.font.fontSize"
            type="number"
            name="size"
            class="form-control"
            placeholder="Enter a font size"
          />
        </div>
        <div>
          <label for="weight">fontWeight</label>
          <input
            id="weight"
            v-model="watermarkOptions.font.fontWeight"
            name="weight"
            class="form-control"
            placeholder="Enter a font weight"
          />
        </div>
        <div>
          <label for="style">fontStyle</label>
          <input
            id="style"
            v-model="watermarkOptions.font.fontStyle"
            name="style"
            class="form-control"
            placeholder="Enter a font style"
          />
        </div>
        <div class="full-width">
          <label for="family">fontFamily</label>
          <input
            id="family"
            v-model="watermarkOptions.font.fontFamily"
            name="family"
            class="form-control"
            placeholder="Enter a font family"
          />
        </div>
      </div>
    </section>
  </main>
  <details class="example-code">
    <summary>Vue example code</summary>
    <button type="button" @click="copyExample">Copy example</button>
    <span role="status">{{ copyStatus }}</span>
    <pre><code>{{ exampleCode }}</code></pre>
  </details>
</template>

<style>
.watermark > div {
  flex: 1;
}
</style>

<style scoped>
.image-controls,
.example-code {
  background: #fff;
  color: #374151;
  padding: 20px 32px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}
.example-buttons,
.image-inputs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.visibility-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 13px;
}
.inline-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.visibility-controls input[type='number'],
.visibility-controls select {
  width: 110px;
}
input[type='checkbox'],
input[type='range'] {
  accent-color: #2563eb;
  vertical-align: middle;
}
input[type='checkbox'] {
  width: 16px;
  height: 16px;
}
.image-inputs {
  align-items: end;
  margin-top: 16px;
}
.image-inputs label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
}
.url-field {
  flex: 1;
  min-width: 180px;
}
.form-control {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #1f2937;
  font: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  color-scheme: light;
}
select.form-control {
  appearance: none;
  padding-right: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px 16px;
}
.form-control::placeholder {
  color: #6b7280;
}
.form-control:hover:not(:disabled) {
  border-color: #9ca3af;
}
.form-control:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-color: #2563eb;
}
.form-control:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}
textarea.form-control {
  resize: vertical;
  min-height: 100px;
}
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: 20px;
  width: 100%;
  padding: 32px;
  background: #fff;
  color: #374151;
  text-align: left;
}
.options-grid label,
.options-grid legend {
  display: block;
  margin-bottom: 6px;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
}
.options-grid fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.options-grid .repeat-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
}
.repeat-toggle input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.switch-track {
  width: 40px;
  height: 24px;
  padding: 3px;
  border-radius: 999px;
  background: #6b7280;
}
.switch-track::before {
  content: '';
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
}
.repeat-toggle input:checked + .switch-track {
  background: #2563eb;
}
.repeat-toggle input:checked + .switch-track::before {
  transform: translateX(16px);
}
.repeat-toggle input:focus-visible + .switch-track {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
}
.field-hint {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #6b7280;
}
.full-width {
  grid-column: 1 / -1;
}
.paired-inputs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.image-inputs input[type='file'] {
  max-width: 260px;
}
button {
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
  padding: 9px 12px;
}
.image-hint {
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
}
p[role='status'] {
  margin: 4px 0 0;
  font-size: 13px;
}
.image-error {
  color: #b91c1c;
}
main {
  min-height: 500px;
}
.example-code summary {
  cursor: pointer;
  margin-bottom: 12px;
}
.example-code pre {
  overflow-x: auto;
  font-size: 13px;
  padding-top: 12px;
}
.example-code span {
  margin-left: 12px;
  font-size: 13px;
}
@media (max-width: 1023px) {
  .watermark {
    min-height: 320px;
  }
  .image-controls,
  .options-grid,
  .example-code {
    padding: 16px;
  }
}
</style>
