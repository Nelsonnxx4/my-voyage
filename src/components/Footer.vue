<template>
  <footer class="bg-black px-4 py-4 lg:p-8">
    <main>
      <div class="flex justify-start items-center gap-2 pb-2">
        <Logo />
        <h4 class="text-inputColor200 font-medium">Zende</h4>
      </div>
      <ul>
        <li
          v-for="(item, index) in NavPaths"
          :key="index"
          :href="item.href"
          class="text-[16px] text-accent200 hover:text-accent100 underline font-medium transition-colors duration-200 md:mr-2 lg:mr-3 cursor-pointer"
          @click.prevent="handleScrollToSection(item.href)"
        >
          <a>
            {{ item.name }}
          </a>
        </li>
      </ul>
    </main>
  </footer>
</template>

<script setup lang="ts">
import Logo from "@/assets/icons/Logo.vue";
import { NavPaths } from "@/constants/constant";
import { scrollToSection } from "@/utils/scrollToSection";

defineOptions({
  name: "AppFooter",
});

const handleScrollToSection = (href: string | undefined) => {
  scrollToSection(href);
};
</script>
