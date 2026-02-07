<template>
  <footer class="bg-black px-4 py-4 lg:p-8">
    <main>
      <div class="flex justify-start items-center gap-2 pb-2">
        <Logo />
        <h4 class="text-inputColor200 font-medium">Zende</h4>
      </div>
      <ul>
        <li>
          <router-link
            to="/signup"
            class="text-sm text-white/75 hover:text-white/65 underline"
          >
            Get Started
          </router-link>
        </li>
        <li>
          <router-link
            to="/signup"
            class="text-sm text-white/75 hover:text-white/65 underline"
          >
            About
          </router-link>
        </li>
        <li>
          <router-link
            to="/signup"
            class="text-sm text-white/75 hover:text-white/65 underline"
          >
            Pricing
          </router-link>
        </li>
        <li>
          <router-link
            to="/signup"
            class="text-sm text-white/75 hover:text-white/65 underline"
          >
            FAQs
          </router-link>
        </li>
      </ul>
    </main>
  </footer>
</template>

<script setup lang="ts">
import Logo from "@/assets/icons/Logo.vue";

defineOptions({
  name: "AppFooter",
});
</script>
