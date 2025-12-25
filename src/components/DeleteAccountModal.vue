<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="close"
    >
      <div
        class="bg-white rounded-lg w-full max-w-xs shadow-xl overflow-hidden border border-gray-100"
      >
        <!-- Modal Content -->
        <div class="p-5">
          <div class="flex flex-col items-center text-center">
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3"
            >
              <DangerIcon fillColor="#dc2626" />
            </div>

            <h2 class="text-lg font-medium text-gray-900">Delete Account</h2>
            <p class="mt-2 text-sm text-gray-500">
              Are you sure you want to delete your account? if you delete your
              account you will lose your data permanently
            </p>

            <div class="mt-5 flex w-full gap-3">
              <button
                type="button"
                @click="close"
                class="flex-1 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="confirmDeleteAccount"
                class="flex-1 rounded-md border border-transparent bg-red-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import DangerIcon from "@/assets/icons/DangerIcon.vue";
import { deleteUserAccount } from "@/services/supabase/auth";
import { useAuth } from "@/composables/useAuth";
import { ref, onMounted, onBeforeUnmount } from "vue";

const { user } = useAuth();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "delete"]);

const close = () => {
  emit("close");
};

const confirmDeleteAccount = () => {
  emit("delete");
  deleteUserAccount(user.value?.id);
};

// Handle escape key press
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen) {
    close();
  }
};

// Handle outside click
const modalRef = ref<HTMLElement | null>(null);
const handleClickOutside = (e: MouseEvent) => {
  if (modalRef.value && !modalRef.value.contains(e.target as Node)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .modal-container {
    width: calc(100% - 2rem);
  }
}
</style>
