<template>
  <div class="auth-callback">
    <Spinner />
    <p>Authenticating...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import Spinner from "@/components/ui/Spinner.vue";
import { handleAuthCallback } from "@/services/supabase/auth";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { redirectBasedOnAuth } = useAuth();

onMounted(async () => {
  try {
    await handleAuthCallback();
    await redirectBasedOnAuth();
  } catch (err) {
    router.push("/login");
  }
});
</script>

<style scoped>
.auth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
