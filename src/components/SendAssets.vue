<script setup lang="ts">

const props = defineProps<{
  show: boolean
}>()
const emit = defineEmits(['update:show'])

const send = () => {
  console.log('send')
}
</script>

<template>
 <div>
  send token
 </div>
</template>
