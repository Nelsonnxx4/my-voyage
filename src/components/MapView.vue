<template>
  <div class="h-80 border rounded-lg overflow-hidden relative bg-gray-100">
    <div ref="mapContainer" class="w-full h-full"></div>

    <div class="absolute inset-0 flex items-center justify-center">
      <Spinner />
    </div>
  </div>
</template>

<script setup lang="ts">
// import { onMounted } from "vue";
// import { useMap } from "@/composables/useMap";

// const { mapContainer, isMapInitialized, initMap } = useMap();

// onMounted(async () => {
//   if (mapContainer.value) {
//     await initMap(mapContainer.value);
//   }
// });
</script>

<style scoped></style>
