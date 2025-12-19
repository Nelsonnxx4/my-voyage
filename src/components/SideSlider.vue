<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity"
      @click="close"
    />
  </transition>
  <transition name="slide">
    <aside
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-64 bg-white dark:bg-dark-background100 shadow-xl dark:shadow-2xl z-50 flex flex-col border-l dark:border-dark-border100"
    >
      <div
        class="p-4 border-b border-gray-200 dark:border-dark-border100 flex justify-between items-center"
      >
        <h4 class="font-semibold text-textblack200 dark:text-dark-textblack200">
          <!-- Menu -->
        </h4>
        <CloseIcon @click="close" fillColor="textblack300" />
      </div>

      <nav class="flex-1 overflow-y-auto p-4">
        <ul class="pb-10">
          <li v-for="item in NavPaths" :key="item.path">
            <RouterLink
              :to="item.path"
              class="block px-4 py-2 rounded-md text-textblack100 dark:text-dark-textblack100 hover:bg-gray-100 dark:hover:bg-dark-background200 transition-colors"
              :class="{
                'bg-gray-100 dark:bg-dark-background200 font-medium': isActive(
                  item.path
                ),
              }"
              @click="close"
            >
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
        <router-link
          to="/signup"
          class="flex justify-between items-center px-5 py-3 rounded-full bg-black text-white shadow hover:bg-gray-800"
        >
          <span> Get Started </span>
          <ArrowOut />
        </router-link>
      </nav>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import CloseIcon from "@/assets/icons/CloseIcon.vue";
import ArrowOut from "@/assets/icons/ArrowOut.vue";
import { NavPaths } from "@/constants/constant";
import { useRoute } from "vue-router";

interface NavItem {
  name: string;
  path: string;
  icon?: string;
}

defineProps<{
  isOpen: boolean;
  navItems?: NavItem[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();

const close = () => {
  emit("close");
};

const isActive = (path: string) => {
  return route.path === path;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
