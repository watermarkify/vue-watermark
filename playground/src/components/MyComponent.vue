<script setup lang="ts">
import { ref } from 'vue'
import { Watermark } from '@watermarkify/vue-watermark'

const watermarkOptions = ref({
  content: 'watermark'
})
</script>

<template>
  <div>
    <h1>Watermark Example</h1>
    <Watermark :options="watermarkOptions">
      <div class="content">This is the content of the slot.</div>
    </Watermark>
  </div>
</template>

<style scoped>
  .content {
    height: 160px;
    width: 800px;
    background: rgb(98, 215, 244);
    padding: 20px;
  }
</style>