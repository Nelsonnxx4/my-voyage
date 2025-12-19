<template>
  <header
    ref="headerRef"
    class="flex justify-between items-center shadow-sm bg-white py-3 px-1 fixed top-0 left-0 right-0 z-50 transition-all duration-300 mb-10"
    :class="{
      'bg-white/90 backdrop-blur-sm shadow-md': isScrolled,
      'bg-transparent': !isScrolled && isTransparent,
    }"
  >
    <div class="flex justify-between items-center">
      <logo />
      <h4 class="text-textblack300 font-medium">Zende</h4>
    </div>

    <!-- Desktop Nav -->
    <nav class="hidden md:flex items-center gap-6 text-sm text-textblack300">
      <a
        href="#start"
        class="hover:text-accent50 transition-colors"
        :class="{ 'text-white': !isScrolled && isTransparent }"
        >Start Here</a
      >
      <a
        href="#benefits"
        class="hover:text-accent50 transition-colors"
        :class="{ 'text-white': !isScrolled && isTransparent }"
        >Benefits</a
      >
      <a
        href="#process"
        class="hover:text-accent50 transition-colors"
        :class="{ 'text-white': !isScrolled && isTransparent }"
        >Process</a
      >
      <a
        href="#compare"
        class="hover:text-accent50 transition-colors"
        :class="{ 'text-white': !isScrolled && isTransparent }"
        >Compare</a
      >
      <router-link
        to="/pricing"
        class="hover:text-accent50 transition-colors"
        :class="{ 'text-white': !isScrolled && isTransparent }"
        >Pricing</router-link
      >
      <a
        href="#faqs"
        class="hover:text-accent50 transition-colors"
        :class="{ 'text-white': !isScrolled && isTransparent }"
        >FAQs</a
      >
      <router-link
        to="/pricing"
        class="ml-2 px-4 py-2 rounded-full transition-all duration-300"
        :class="{
          'bg-black text-white hover:bg-gray-800': isScrolled,
          'bg-white text-black hover:bg-gray-100': !isScrolled && isTransparent,
        }"
      >
        View Plans
      </router-link>
    </nav>

    <!-- Mobile -->
    <Menu
      @click="openMenu"
      :fillColor="
        !isScrolled && isTransparent ? 'text-white' : 'text-textblack300'
      "
      size="22"
      class="md:hidden transition-colors"
    />
  </header>
  <SideSlider :isOpen="isMenuOpen" @close="closeMenu" />
</template>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });
import Logo from "@/assets/icons/Logo.vue";
import Menu from "@/assets/icons/Menu.vue";
import SideSlider from "@/components/SideSlider.vue";
import { ref, onMounted, onUnmounted } from "vue";

const headerRef = ref(null);
const isScrolled = ref(false);
const isTransparent = ref(true);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const isMenuOpen = ref(false);

const openMenu = () => {
  isMenuOpen.value = true;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<style scoped></style>
