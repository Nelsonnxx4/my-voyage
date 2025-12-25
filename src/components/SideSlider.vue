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
        <CloseIcon
          @click="close"
          fillColor="textblack300"
          class="cursor-pointer"
        />
      </div>

      <nav class="flex-1 overflow-y-auto p-4">
        <ul class="pb-10">
          <li>
            <a
              v-for="(item, index) in NavPaths"
              :key="index"
              :href="item.href"
              class="text-[16px] text-accent100 hover:text-accent50 font-medium transition-colors duration-200 md:mr-2 lg:mr-3"
              @click.prevent="scrollToSection(item.href)"
            >
              {{ item.name }}
            </a>
          </li>
        </ul>
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
      </nav>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import CloseIcon from "@/assets/icons/CloseIcon.vue";
import ArrowOut from "@/assets/icons/ArrowOut.vue";
import { NavPaths } from "@/constants/constant";
import { useAuth } from "@/composables/useAuth";

interface NavItem {
  name: string;
  path: string;
  icon?: string;
}

const { user } = useAuth();

defineProps<{
  isOpen: boolean;
  navItems?: NavItem[];
}>();

const emit = defineEmits<{
  close: [];
}>();

// const route = useRoute();

const close = () => {
  emit("close");
};
const scrollToSection = (href: string | undefined) => {
  close();

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
// const isActive = (path: string) => {
//   return route.path === path;
// };
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
