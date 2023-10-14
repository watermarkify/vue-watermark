<script setup lang="ts">
import { ref } from 'vue'
import { Watermark } from '@watermarkify/vue-watermark'

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
          <label for="content" class="block mb-1 lg:mb-2">Content</label>
          <input
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            id="content"
            type="text"
            placeholder="Enter watermark content"
            v-model="watermarkOptions.content"
          />
        </div>
        <div>
          <label for="width" class="block mb-1 lg:mb-2">Width</label>
          <input
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            id="width"
            type="number"
            placeholder="Enter width"
            v-model="watermarkOptions.width"
          />
        </div>
        <div>
          <label for="height" class="block mb-1 lg:mb-2">Height</label>
          <input
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            id="height"
            type="number"
            placeholder="Enter height"
            v-model="watermarkOptions.height"
          />
        </div>
        <div class="md:justify-between">
          <div class="mb-4 md:mb-0">
            <label for="gap" class="block mb-1 lg:mb-2"> [GapX GapY] </label>
            <div class="flex">
              <input
                class="shadow appearance-none border w-1/2 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
                id="gap_x"
                type="number"
                placeholder="Enter Gap X"
                v-model="watermarkOptions.gap[0]"
              />
              <span class="mx-2 flex items-center"></span>
              <input
                class="shadow appearance-none border w-1/2 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
                id="gap_y"
                type="number"
                placeholder="Enter Gap Y"
                v-model="watermarkOptions.gap[1]"
              />
            </div>
          </div>
        </div>
        <div>
          <div class="mb-4 md:mb-0">
            <label for="offset" class="block mb-1 lg:mb-2"> [OffsetX OffsetY] </label>
            <div class="flex">
              <input
                class="shadow appearance-none border w-1/2 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
                id="offset_x"
                type="number"
                placeholder="Enter offset X"
                v-model="watermarkOptions.offset[0]"
              />
              <span class="mx-2 flex items-center"></span>
              <input
                class="shadow appearance-none border w-1/2 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
                id="offset_y"
                type="number"
                placeholder="Enter offset Y"
                v-model="watermarkOptions.offset[1]"
              />
            </div>
          </div>
        </div>
        <div>
          <label for="zIndex" class="block mb-1 lg:mb-2">zIndex</label>
          <input
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            id="zIndex"
            type="number"
            placeholder="Enter zIndex"
            v-model="watermarkOptions.zIndex"
          />
        </div>
        <div>
          <label for="rotate" class="block mb-1 lg:mb-2">rotate</label>
          <input
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            id="rotate"
            type="number"
            min="-180"
            max="180"
            placeholder="Enter rotate"
            v-model="watermarkOptions.rotate"
          />
        </div>

        <div>
          <label for="color" class="block mb-1 lg:mb-2">fontColor</label>
          <input
            type="text"
            id="color"
            name="color"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a color value"
            v-model="watermarkOptions.font.color"
          />
        </div>
        <div>
          <label for="size" class="block mb-1 lg:mb-2">fontSize</label>
          <input
            type="number"
            id="size"
            name="size"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a font size"
            v-model="watermarkOptions.font.fontSize"
          />
        </div>
        <div>
          <label for="weight" class="block mb-1 lg:mb-2">fontWeight</label>
          <input
            id="weight"
            name="weight"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a font weight"
            v-model="watermarkOptions.font.fontWeight"
          />
        </div>
        <div>
          <label for="style" class="block mb-1 lg:mb-2">fontStyle</label>
          <input
            id="style"
            name="style"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a font style"
            v-model="watermarkOptions.font.fontStyle"
          />
        </div>
        <div>
          <label for="family" class="block mb-1 lg:mb-2">fontFamily</label>
          <input
            id="family"
            name="family"
            class="shadow appearance-none border w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            placeholder="Enter a font family"
            v-model="watermarkOptions.font.fontFamily"
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
