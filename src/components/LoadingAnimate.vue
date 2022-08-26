<script setup lang="ts">

</script>

<template>

  <div class="flex justify-center items-center h-60">
    <div class="loading"></div>
  </div>
</template>
<style scoped>
[class*=loading]:before {
  content:"Loading...";
  color: var(--color-text-secondary);
  font-size: 20px;
}
.loading {
  font-weight: bold;
  font-family: sans-serif;
  font-size: 30px;
  padding-bottom: 8px;
  background:linear-gradient(var(--color-text-secondary) 0 0) bottom left/0% 3px no-repeat;
  animation:loading 2s linear infinite;
}
@keyframes loading {to{background-size: 100% 3px}}
</style>
