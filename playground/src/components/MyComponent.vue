<script setup>
import { ref } from 'vue'
import Watermark from '@watermarkify/vue-watermark'

const watermarkOptions = ref({
    content: 'Confidential',
  },
)
</script>

<template>
  <div>
    <h1>Watermark Example</h1>
    <Watermark :options="watermarkOptions">
      <p>This is the content of the slot.</p>
    </Watermark>
  </div>
</template>
