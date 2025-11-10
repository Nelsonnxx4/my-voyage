<template>
  <main class="w-full rounded-2xl z-50 max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div
      class="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-dark-background100 z-10 pb-4"
    >
      <h2
        class="text-2xl font-semibold text-gray-800 dark:text-dark-textblack200"
      >
        User Modal
      </h2>
      <CloseIcon
        fillColor="border300"
        class="flex justify-end cursor-pointer"
        @click="handleClose"
      />
    </div>

    <!-- Tabs -->
    <nav
      aria-label="Settings tabs"
      class="h-12 flex rounded-lg bg-gray-100 dark:bg-dark-background200 text-gray-600 dark:text-dark-text text-sm font-medium mb-8 select-none sticky top-16 z-10"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex justify-center items-center flex-1 h-10 mt-1"
        :class="{
          'rounded-l-lg': tab.id === 'general',
          'rounded-r-lg': tab.id === 'about',
          'bg-white dark:bg-dark-background100 text-accent200 dark:text-dark-accent200 shadow-sm rounded-lg font-semibold':
            activeTab === tab.id,
          'hover:bg-gray-50 dark:hover:bg-dark-background200':
            activeTab !== tab.id,
        }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="space-y-6 pb-6">
      <div v-if="loading" class="flex justify-center items-center py-8">
        <Spinner />
      </div>

      <div v-else-if="activeTab === 'profile' && userData" class="space-y-6">
        <div class="space-y-4">
          <h3
            class="text-lg font-semibold text-gray-800 dark:text-dark-textblack200"
          >
            Profile Photo
          </h3>
          <div class="space-y-2 relative">
            <input
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              class="hidden"
              ref="fileInput"
            />

            <div class="flex flex-col items-center space-y-4">
              <div class="relative">
                <div
                  v-if="!userData.profile_image"
                  class="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
                  :style="{ backgroundColor: placeholderColor }"
                  :aria-label="`Avatar for ${userData.name}`"
                  @click="openFileInput"
                >
                  {{ abbreviation }}
                </div>

                <div
                  v-else
                  class="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                  @click="openFileInput"
                >
                  <img
                    :src="userData.profile_image"
                    :alt="`Profile image for ${userData.name}`"
                    class="w-full h-full object-cover"
                  />

                  <div
                    class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200"
                  >
                    <EditIcon
                      class="opacity-0 group-hover:opacity-100 text-white transition-opacity duration-200"
                      size="20"
                    />
                  </div>
                </div>

                <div
                  v-if="isImgLoading"
                  class="absolute inset-0 bg-gray-200 dark:bg-dark-background200 bg-opacity-50 flex items-center justify-center rounded-full"
                >
                  <Spinner size="sm" />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-2">
                <!-- Upload/Change Button -->
                <ReusableButton
                  variant="secondary"
                  size="sm"
                  @click="openFileInput"
                  :disabled="isImgLoading"
                  :label="
                    userData.profile_image ? 'Change Photo' : 'Upload Photo'
                  "
                />

                <!-- Remove Button (only show when image exists) -->
                <ReusableButton
                  v-if="userData.profile_image"
                  variant="danger"
                  size="sm"
                  @click="handleDeleteImage"
                  :disabled="isImgLoading"
                  label="Remove Photo"
                />
              </div>

              <!-- Help text -->
              <p
                class="text-xs text-gray-500 dark:text-dark-textblack50 text-center max-w-xs"
              >
                Click on your photo or the button above to upload a new image
              </p>
            </div>
          </div>
        </div>

        <!-- User Information Section -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3
              class="text-lg font-semibold text-gray-800 dark:text-dark-textblack200"
            >
              Personal Info
            </h3>
            <div class="flex gap-2">
              <ReusableButton
                v-if="!isEditingProfile"
                class="text-sm px-2 py-2 bg-accent100 dark:bg-dark-accent100 text-white hover:bg-accent200 dark:hover:bg-dark-accent200"
                @click="startEditingProfile"
                label="Edit Profile"
              />
              <template v-else>
                <ReusableButton
                  class="text-sm px-4 py-2 bg-green-600 text-white hover:bg-green-700"
                  @click="saveProfileChanges"
                  :disabled="isUpdating"
                  label="Save"
                />
                <ReusableButton
                  class="text-sm px-4 py-2 bg-gray-500 text-white hover:bg-gray-600"
                  @click="cancelEditingProfile"
                  label="Cancel"
                />
              </template>
            </div>
          </div>

          <!-- Name Field -->
          <div class="space-y-2">
            <label
              class="text-sm font-medium text-gray-700 dark:text-dark-textblack100"
              >Name</label
            >
            <div
              v-if="!isEditingProfile"
              class="flex justify-between items-center border-b border-gray-200 dark:border-dark-border100 pb-2"
            >
              <span
                class="font-semibold text-gray-800 dark:text-dark-textblack200"
                >{{ userData.name || "Guest" }}</span
              >
            </div>
            <div v-else class="space-y-1">
              <ReusableInput
                v-model="editForm.name"
                placeholder="Enter your name"
                class="w-full"
              />
              <p
                v-if="editFormErrors.name"
                class="text-sm text-red-600 dark:text-red-400"
              >
                {{ editFormErrors.name }}
              </p>
            </div>
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label
              class="text-sm font-medium text-gray-700 dark:text-dark-textblack100"
              >Email</label
            >
            <div
              v-if="!isEditingProfile"
              class="flex justify-between items-center border-b border-gray-200 dark:border-dark-border100 pb-2"
            >
              <span
                class="font-semibold text-gray-800 dark:text-dark-textblack200"
                >{{ maskedEmail }}</span
              >
              <div class="flex items-center gap-2">
                <span
                  v-if="isEmailConfirmed"
                  class="text-xs text-green-600 dark:text-green-400 font-medium"
                  >✓ Verified</span
                >
                <span
                  v-else
                  class="text-xs text-orange-600 dark:text-orange-400 font-medium"
                  >⚠ Unverified</span
                >
              </div>
            </div>
            <div v-else class="space-y-1">
              <ReusableInput
                v-model="editForm.email"
                type="email"
                placeholder="Enter your email"
                class="w-full"
              />
              <p
                v-if="editFormErrors.email"
                class="text-sm text-red-600 dark:text-red-400"
              >
                {{ editFormErrors.email }}
              </p>
              <div v-if="!isEmailConfirmed" class="flex items-center gap-2">
                <ReusableButton
                  class="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  @click="resendEmailConfirmation"
                  :disabled="isUpdating"
                  label="Resend Verification"
                />
              </div>
            </div>
          </div>

          <!-- Account Status -->
          <div class="space-y-2">
            <label
              class="text-sm font-medium text-gray-700 dark:text-dark-textblack100"
              >Account Status</label
            >
            <div
              class="flex justify-between items-center border-b border-gray-200 dark:border-dark-border100 pb-2"
            >
              <span
                @click="navigateToPricing"
                class="font-semibold text-gray-800 dark:text-dark-textblack200 underline underline-offset-2 cursor-pointer hover:text-accent200 dark:hover:text-dark-accent200"
              >
                {{ userData.is_premium ? "Premium" : "Basic" }}
              </span>
              <span class="text-xs text-gray-500 dark:text-dark-textblack50"
                >Click to upgrade</span
              >
            </div>
          </div>

          <!-- Member Since -->
          <div v-if="userData.created_at" class="space-y-2">
            <label
              class="text-sm font-medium text-gray-700 dark:text-dark-textblack100"
              >Member Since</label
            >
            <div
              class="flex justify-between items-center border-b border-gray-200 dark:border-dark-border100 pb-2"
            >
              <span
                class="font-semibold text-gray-800 dark:text-dark-textblack200"
                >{{ joinedAgo || "—" }}</span
              >
            </div>
          </div>
        </div>

        <!-- Account Actions Section -->
        <div
          class="space-y-4 pt-6 -px-6 border-t border-gray-200 dark:border-dark-border100"
        >
          <h3
            class="text-lg font-semibold text-gray-800 dark:text-dark-textblack200"
          >
            Account Actions
          </h3>

          <!-- Log Out -->
          <div class="flex justify-between items-center">
            <div>
              <label
                class="text-sm font-medium text-gray-700 dark:text-dark-textblack100"
                >Log out</label
              >
              <p class="text-xs text-gray-500 dark:text-dark-textblack50">
                Sign out of your account
              </p>
            </div>
            <ReusableButton
              class="text-sm px-2 py-2 text-gray-700 dark:text-dark-textblack200 border border-gray-300 dark:border-dark-border100 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-background200"
              @click="openLogoutModal"
              label="Log Out"
            />
          </div>

          <!-- Delete Account -->
          <div class="flex justify-between items-center">
            <div>
              <label
                class="text-sm font-medium text-gray-700 dark:text-dark-textblack100"
                >Delete account</label
              >
              <p class="text-xs text-red-500 dark:text-red-400">
                This action cannot be undone
              </p>
            </div>
            <ReusableButton
              class="text-sm px-2 py-2 bg-red-700 dark:bg-red-700/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
              @click="openDeleteAccountModal"
              label="Delete Account"
            />
          </div>
        </div>

        <!-- Error Display -->
        <div
          v-if="error"
          class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg"
        >
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          <ReusableButton
            class="mt-2 text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40"
            @click="clearError"
            label="Dismiss"
          />
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg"
        >
          <p class="text-sm text-green-600 dark:text-green-400">
            {{ successMessage }}
          </p>
          <ReusableButton
            class="mt-2 text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40"
            @click="successMessage = ''"
            label="Dismiss"
          />
        </div>
      </div>

      <!-- General Tab Content -->
      <section class="space-y-6" v-if="activeTab === 'general'">
        <div class="flex justify-between items-center">
          <span class="text-gray-700 dark:text-dark-textblack100">Theme</span>
          <select
            :value="theme"
            @change="
              setTheme(($event.target as HTMLSelectElement).value as any)
            "
            class="appearance-none bg-white dark:bg-dark-background100 text-gray-800 dark:text-dark-textblack200 border border-gray-300 dark:border-dark-border100 rounded-md shadow-sm py-1 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="themeOption in availableThemes"
              :key="themeOption.value"
              :value="themeOption.value"
              class="bg-white dark:bg-dark-background100 hover:bg-gray-100 dark:hover:bg-dark-background200"
            >
              {{ themeOption.label }}
            </option>
          </select>
        </div>
      </section>

      <!-- About Tab Content -->
      <section class="space-y-6" v-if="activeTab === 'about'">
        <div class="text-center space-y-4">
          <h3
            class="text-lg font-semibold text-gray-800 dark:text-dark-textblack200"
          >
            About My Voyage
          </h3>
          <p class="text-gray-600 dark:text-dark-text">Version 1.0.0</p>
          <p class="text-sm text-gray-500 dark:text-dark-textblack50">
            A travel companion app for documenting your journeys
          </p>
        </div>
      </section>
    </div>

    <!-- Modals -->
    <LogoutModal
      :isOpen="showLogoutModal"
      @close="closeLogoutModal"
      @confirm="confirmLogout"
    />
    <DeleteAccountModal
      :isOpen="showDeleteAccountModal"
      @close="closeDeleteAccountModal"
      @confirm="confirmDeleteAccount(userData?.id)"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import CloseIcon from "@/assets/icons/CloseIcon.vue";
import LogoutModal from "@/components/LogoutModal.vue";
import ReusableButton from "@/components/ui/ReusableButton.vue";
import ReusableInput from "@/components/ui/ReusableInput.vue";
import Spinner from "@/components/ui/Spinner.vue";
import { useAuth } from "@/composables/useAuth";
import { useUserProfile } from "@/composables/useUserProfile";
import { useAvatarAbbreviation } from "@/composables/useAvatarAbbreviation";
import { useUserModal } from "@/utils/userModal";
import { dateAndTime } from "@/utils/date-and-timeUtils";
import { tabs } from "@/constants/userConstant";
import DeleteAccountModal from "./DeleteAccountModal.vue";
import EditIcon from "@/assets/icons/EditIcon.vue";

const { handleLogout } = useAuth();

const {
  activeTab,
  showLogoutModal,
  showDeleteAccountModal,
  openLogoutModal,
  closeLogoutModal,
  openDeleteAccountModal,
  closeDeleteAccountModal,
  confirmDeleteAccount,
  isEditingProfile,
  editForm,
  editFormErrors,
  startEditingProfile,
  cancelEditingProfile,
  saveProfileChanges,
  successMessage,
  // Profile image handling
  fileInput,
  isImgLoading,
  openFileInput,
  handleImageUpload,
  handleDeleteImage,
  resendEmailConfirmation,
  // Theme handling
  theme,
  setTheme,
  availableThemes,
} = useUserModal();

const {
  maskedEmail,
  userData,
  loading,
  error,
  isUpdating,
  isEmailConfirmed,
  clearError,
} = useUserProfile();

const { getJoinedAgoForUser } = dateAndTime();

const joinedAgo = getJoinedAgoForUser(userData.value);
const router = useRouter();

const navigateToPricing = () => {
  router.push("/pricing");
};

const emit = defineEmits(["close"]);

const handleClose = () => {
  emit("close");
};

interface Props {
  avatarUrl?: string | null;
  username: string | null;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: null,
  username: null,
  size: 100,
});

const { abbreviation } = useAvatarAbbreviation(props.username);

const confirmLogout = () => {
  console.log("Logging out from all devices...");
  handleLogout();
};

const placeholderColor = computed(() => {
  if (!props.username) return "#cccccc";

  let hash = 0;
  for (let i = 0; i < props.username.length; i++) {
    hash = props.username.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
});
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

.avatar-placeholder,
.avatar-image {
  width: v-bind('props.size + "px"');
  height: v-bind('props.size + "px"');
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
}

.avatar-image {
  object-fit: cover;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 5px;
}

/* ::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-dark-background200 rounded-full;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-dark-border200 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-dark-border300;
} */
</style>
