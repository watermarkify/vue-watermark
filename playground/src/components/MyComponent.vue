<script setup>
import { ref } from 'vue'
import { Watermark } from '@watermarkify/vue-watermark'

const watermarkOptions = ref({
    content: 'Confidential',
  },
)
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
    height: 500px;
    width: 500px;
    background: green;
  }
</style>