<script setup lang="ts">
import { Watermark } from '@watermarkify/vue-watermark'
import { ref } from 'vue'

const watermarkOptions = ref({
  content: 'watermark',
  gap: [20, 20],
  offset: [10, 10],
  zIndex: 5,
  rotate: -20,
  font: {
    color: 'rgba(0,0,0,.2)',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'sans-serif',
  },
  width: undefined,
  height: undefined,
})
</script>

<template>
  <main class="flex flex-col lg:flex-row flex-1 items-stretch">
    <section class="flex flex-2 lg:flex-1 bg-watermarkify-500">
      <Watermark :options="watermarkOptions" class="watermark flex flex-1">
        <div class="p-4 h-full">This is the content of the slot.</div>
      </Watermark>
    </section>

    <section class="flex-1 flex items-stretch">
      <div
        class="w-full grid lg:grid-flow-col lg:grid-rows-7 grid-cols-2 gap-x-5 lg:gap-x-10 p-5 lg:p-10 shadow-md bg-white text-xs lg:text-base text-gray-700 font-bold"
      >
        <div>
          <label for="content" class="block mb-1 lg:mb-2">content</label>
          <input
            id="content"
            v-model="watermarkOptions.content"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            type="text"
            placeholder="Enter watermark content"
          />
        </div>
        <div>
          <label for="width" class="block mb-1 lg:mb-2">width</label>
          <input
            id="width"
            v-model="watermarkOptions.width"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            type="number"
            placeholder="Enter width"
          />
        </div>
        <div>
          <label for="height" class="block mb-1 lg:mb-2">height</label>
          <input
            id="height"
            v-model="watermarkOptions.height"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            type="number"
            placeholder="Enter height"
          />
        </div>
        <div class="md:justify-between">
          <div class="mb-4 md:mb-0">
            <label for="gap" class="block mb-1 lg:mb-2"> [gapX, gapY] </label>
            <div class="flex">
              <input
                id="gap_x"
                v-model="watermarkOptions.gap[0]"
                class="shadow appearance-none border w-1/2 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Enter Gap X"
              />
              <span class="mx-2 flex items-center" />
              <input
                id="gap_y"
                v-model="watermarkOptions.gap[1]"
                class="shadow appearance-none border w-1/2 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Enter Gap Y"
              />
            </div>
          </div>
        </div>
        <div>
          <div class="mb-4 md:mb-0">
            <label for="offset" class="block mb-1 lg:mb-2"> [offsetX, offsetY] </label>
            <div class="flex">
              <input
                id="offset_x"
                v-model="watermarkOptions.offset[0]"
                class="shadow appearance-none border w-1/2 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Enter offset X"
              />
              <span class="mx-2 flex items-center" />
              <input
                id="offset_y"
                v-model="watermarkOptions.offset[1]"
                class="shadow appearance-none border w-1/2 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Enter offset Y"
              />
            </div>
          </div>
        </div>
        <div>
          <label for="zIndex" class="block mb-1 lg:mb-2">zIndex</label>
          <input
            id="zIndex"
            v-model="watermarkOptions.zIndex"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            type="number"
            placeholder="Enter zIndex"
          />
        </div>
        <div>
          <label for="rotate" class="block mb-1 lg:mb-2">rotate</label>
          <input
            id="rotate"
            v-model="watermarkOptions.rotate"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            type="number"
            min="-180"
            max="180"
            placeholder="Enter rotate"
          />
        </div>

        <div>
          <label for="color" class="block mb-1 lg:mb-2">fontColor</label>
          <input
            id="color"
            v-model="watermarkOptions.font.color"
            type="text"
            name="color"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a color value"
          />
        </div>
        <div>
          <label for="size" class="block mb-1 lg:mb-2">fontSize</label>
          <input
            id="size"
            v-model="watermarkOptions.font.fontSize"
            type="number"
            name="size"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a font size"
          />
        </div>
        <div>
          <label for="weight" class="block mb-1 lg:mb-2">fontWeight</label>
          <input
            id="weight"
            v-model="watermarkOptions.font.fontWeight"
            name="weight"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a font weight"
          />
        </div>
        <div>
          <label for="style" class="block mb-1 lg:mb-2">fontStyle</label>
          <input
            id="style"
            v-model="watermarkOptions.font.fontStyle"
            name="style"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a font style"
          />
        </div>
        <div>
          <label for="family" class="block mb-1 lg:mb-2">fontFamily</label>
          <input
            id="family"
            v-model="watermarkOptions.font.fontFamily"
            name="family"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a font family"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<style>
.watermark > div {
  flex: 1;
}
</style>
