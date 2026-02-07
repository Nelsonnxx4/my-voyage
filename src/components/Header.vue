<template>
  <header
    ref="headerRef"
    class="flex justify-between items-center shadow-sm bg-white py-3 px-1 md:px-2 xl:px-16 fixed top-0 left-0 right-0 z-50 transition-all duration-300 mb-10"
    :class="{
      'bg-white/90 backdrop-blur-sm shadow-md': isScrolled,
      'bg-transparent': !isScrolled && isTransparent,
    }"
  >
    <router-link to="/" class="flex justify-between items-center">
      <logo />
      <h4 class="text-textblack300 font-medium">Zende</h4>
    </router-link>

    <!-- Desktop Nav -->
    <nav
      class="hidden md:flex justify-between items-center text-sm text-textblack300"
    >
      <ul class="flex justify-between items-center gap-2">
        <li
          v-for="(item, index) in NavPaths"
          :key="index"
          :href="item.href"
          class="text-[16px] text-accent100 hover:text-accent50 font-medium transition-colors duration-200 md:mr-2 lg:mr-3"
          @click.prevent="scrollToSection(item.href)"
        >
          <a>
            {{ item.name }}
          </a>
        </li>
        <li>
          <router-link
            to="/about"
            class="text-[16px] text-accent100 hover:text-accent50 font-medium transition-colors duration-200 md:mr-2 lg:mr-3"
          >
            About
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="hidden md:flex">
      <router-link
        v-if="!user"
        to="/login"
        class="flex justify-between items-center gap-2 md:ml-4 px-4 py-2 rounded-full bg-black text-white shadow hover:bg-gray-800"
      >
        <span> Get Started </span>
        <ArrowOut />
      </router-link>

      <router-link
        v-else
        to="/voyages"
        class="flex justify-between items-center gap-2 md:ml-4 px-4 py-2 rounded-full bg-black text-white shadow hover:bg-gray-800"
      >
        <span> Get Started </span>
        <ArrowOut />
      </router-link>
    </div>

    <!-- Mobile -->
    <Menu
      @click="openMenu"
      :fillColor="
        !isScrolled && isTransparent ? 'text-white' : 'text-textblack300'
      "
      size="22"
      class="md:hidden transition-colors cursor-pointer"
    />
  </header>
  <SideSlider :isOpen="isMenuOpen" @close="closeMenu" />
</template>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });
import Logo from "@/assets/icons/Logo.vue";
import Menu from "@/assets/icons/Menu.vue";
import ArrowOut from "@/assets/icons/ArrowOut.vue";

import SideSlider from "@/components/SideSlider.vue";
import { NavPaths } from "@/constants/constant";
import { useAuth } from "@/composables/useAuth";
import { ref, onMounted, onUnmounted } from "vue";

const headerRef = ref(null);
const isScrolled = ref(false);
const isTransparent = ref(true);

const { user } = useAuth();

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
const scrollToSection = (href: string | undefined) => {
  isMenuOpen.value = false;

  const sectionId: string | undefined = href?.replace("#", "");
  if (!sectionId) return;
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
</script>

<style scoped></style>
