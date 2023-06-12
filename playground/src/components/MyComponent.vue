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
  <div class="flex h-full w-full">
    <div>
      <Watermark :options="watermarkOptions">
        <div class="content">This is the content of the slot.</div>
      </Watermark>
    </div>
    <div class="w-full h-full">
      <section class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2" for="content"> Content </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="content"
            type="text"
            placeholder="Enter watermark content"
            v-model="watermarkOptions.content"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2" for="width"> Width </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="width"
            type="number"
            placeholder="Enter width"
            v-model="watermarkOptions.width"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2" for="height"> Height </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="height"
            type="number"
            placeholder="Enter height"
            v-model="watermarkOptions.height"
          />
        </div>
        <div class="mb-4 md:flex md:justify-between">
          <div class="mb-4 md:mb-0">
            <label class="block text-gray-700 font-bold mb-2" for="gap"> [GapX, GapY] </label>
            <div class="flex">
              <input
                class="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="gap_x"
                type="number"
                placeholder="Enter Gap X"
                v-model="watermarkOptions.gap[0]"
              />
              <span class="mx-2 flex items-center"></span>
              <input
                class="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="gap_y"
                type="number"
                placeholder="Enter Gap Y"
                v-model="watermarkOptions.gap[1]"
              />
            </div>
          </div>
        </div>
        <div class="mb-4">
          <div class="mb-4 md:mb-0">
            <label class="block text-gray-700 font-bold mb-2" for="offset"> [OffsetX, OffsetY] </label>
            <div class="flex">
              <input
                class="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="offset_x"
                type="number"
                placeholder="Enter offset X"
                v-model="watermarkOptions.offset[0]"
              />
              <span class="mx-2 flex items-center"></span>
              <input
                class="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="offset_y"
                type="number"
                placeholder="Enter offset Y"
                v-model="watermarkOptions.offset[1]"
              />
            </div>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2" for="zIndex"> zIndex </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="zIndex"
            type="number"
            placeholder="Enter zIndex"
            v-model="watermarkOptions.zIndex"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2" for="rotate"> rotate </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="rotate"
            type="number"
            min="-180"
            max="180"
            placeholder="Enter rotate"
            v-model="watermarkOptions.rotate"
          />
        </div>
      </section>
    </div>
    <div class="w-full h-full">
      <section class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <div class="mb-4">
            <label for="color" class="block text-gray-700 font-bold mb-2">fontColor</label>
            <input
              type="text"
              id="color"
              name="color"
              class="w-full border-gray-400 py-2 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="Enter a color value"
              v-model="watermarkOptions.font.color"
            />
          </div>
          <div class="mb-4">
            <label for="size" class="block text-gray-700 font-bold mb-2">fontSize</label>
            <input
              type="number"
              id="size"
              name="size"
              class="w-full border-gray-400 py-2 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="Enter a font size"
              v-model="watermarkOptions.font.fontSize"
            />
          </div>
          <div class="mb-4">
            <label for="weight" class="block text-gray-700 font-bold mb-2">fontWeight</label>
            <input
              id="weight"
              name="weight"
              class="w-full border-gray-400 py-2 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="Enter a font weight"
              v-model="watermarkOptions.font.fontWeight"
            />
          </div>
          <div class="mb-4">
            <label for="style" class="block text-gray-700 font-bold mb-2">fontStyle</label>
            <input
              id="style"
              name="style"
              class="w-full border-gray-400 py-2 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="Enter a font style"
              v-model="watermarkOptions.font.fontStyle"
            />
          </div>
          <div class="mb-4">
            <label for="family" class="block text-gray-700 font-bold mb-2">fontFamily</label>
            <input
              id="family"
              name="family"
              class="w-full border-gray-400 py-2 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="Enter a font family"
              v-model="watermarkOptions.font.fontFamily"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.content {
  height: 800px;
  width: 800px;
  background: rgb(98, 215, 244);
  padding: 20px;
}
</style>
