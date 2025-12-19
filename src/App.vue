<template>
  <UApp>
    <RouterView />
    <ToastContainer />
  </UApp>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import ToastContainer from "@/components/ui/ToastContainer.vue";
import { useAuth } from "@/composables/useAuth";

const { checkAuth } = useAuth();

onMounted(() => {
  checkAuth();
});
</script>

<style scoped></style>
