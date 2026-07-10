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
import { useTheme } from "@/composables/useTheme";

const { checkAuth } = useAuth();
useTheme();

onMounted(() => {
  checkAuth();
});
</script>

<style scoped></style>
