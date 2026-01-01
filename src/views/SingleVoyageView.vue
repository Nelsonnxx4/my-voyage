<template>
  <header
    class="flex justify-between items-center sticky top-0 z-50 w-full bg-white border-b transition-shadow px-2 py-2"
    :class="{ 'shadow-md': scrolled }"
  >
    <div class="flex items-center gap-2">
      <router-link to="/" class="flex items-center justify-center">
        <Logo />
      </router-link>
      <div v-if="isDetailLoading">
        <USkeleton class="h-4 w-[150px] base rounded-md bg-skeleton" />
      </div>
      <h3 v-else class="text-xl text-textblack100">
        {{ voyage ? `Your trip to ${voyage.location}` : "Voyage Not Found" }}
      </h3>
    </div>
    <div
      class="flex justify-center items-center uppercase rounded-full outline outline-accent50 hover:outline-[#6fa198] outline-offset-2 w-7 h-7 cursor-pointer"
      @click="openProfileModal"
    >
      <UTooltip :text="userData?.name">
        <UAvatar :src="userData?.profile_image" :alt="userData?.name" full />
      </UTooltip>
    </div>
  </header>

  <!-- Profile modal -->
  <ReusableModal :isOpen="isProfileModal" @close="closeProfileModal">
    <UserModal
      :username="userData?.name ?? null"
      :avatar-url="userData?.profile_image"
      @close="closeProfileModal"
    />
  </ReusableModal>

  <div v-if="isDetailLoading">
    <SingleVoyageSkeleton />
  </div>

  <div v-else-if="detailError">
    <div
      class="w-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-8 py-6 text-center"
    >
      <p class="text-red-600 mb-4">{{ detailError || "Voyage not found" }}</p>
      <div class="flex gap-4 justify-center">
        <button
          @click="loadVoyageData"
          class="px-4 py-2 bg-accent50 text-white rounded hover:bg-accent70 transition-colors"
        >
          Retry
        </button>
        <router-link
          to="/voyages"
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Back to Voyages
        </router-link>
      </div>
    </div>
  </div>

  <main v-else class="w-full max-w-7xl mx-auto px-4 sm:px-10 lg:px-8 py-6">
    <!-- Back Button -->
    <router-link
      to="/voyages"
      class="flex items-center gap-2 text-accent50 hover:text-accent70 transition-colors mb-6 w-max"
    >
      <ArrowBack fillColor="currentColor" />
      <span class="font-medium">Back to Voyages</span>
    </router-link>

    <!-- Main Content -->
    <div
      id="journal-content"
      v-if="voyage"
      class="flex flex-col lg:flex-row gap-8 xl:gap-12"
    >
      <!-- Left Column - Voyage Details -->
      <div class="flex-1">
        <!-- Voyage Card -->
        <article class="bg-white rounded-xl shadow-sm overflow-hidden">
          <!-- Image with Heart Icon -->
          <div class="relative">
            <img
              v-if="voyage.image_urls && voyage.image_urls.length > 0"
              :src="voyage.image_urls[0]"
              :alt="voyage.title"
              class="w-full h-auto max-h-[400px] object-cover"
            />
            <div
              v-else
              class="w-full h-64 bg-gray-100 flex items-center justify-center"
            >
              <span class="text-gray-400">No image available</span>
            </div>
          </div>

          <!-- Content -->
          <div class="py-3 px-2 sm:py-5 sm:px-4">
            <!-- Title and Menu -->
            <div class="flex justify-between items-start gap-2">
              <h3
                class="text-xl md:text-2xl font-medium text-gray-900 flex-wrap"
              >
                {{ voyage.title }}
              </h3>
              <div
                @click.stop="openOptionsModal(voyage.id)"
                class="cursor-pointer hover:text-gray-700 transition-colors"
              >
                <VerticalThreeDots fillColor="textblack100" />
              </div>
            </div>

            <!-- Location and Date -->
            <div class="mt-2 flex items-center gap-2 text-normal">
              <LocationIcon size="26" />
              <span class="line-clamp-1">{{ voyage.location }}</span>
              <span class="hidden md:block">•</span>
              <span class="hidden md:block">{{
                relativeTripDate([voyage.start_date, voyage.end_date])
              }}</span>
            </div>

            <!-- Created At -->
            <div class="flex flex-wrap items-center gap-2 text-normal mb-3">
              <WhatTimeIcon size="26" />
              <span>Created:</span>
              <span class="">{{
                relativeCreatedAt(new Date(voyage.created_at))
              }}</span>
            </div>

            <!-- Rating -->
            <div class="mt-6 pt-4 border-t border-gray-100">
              <div class="flex items-center gap-3">
                <Rating :rating="voyage.rating" size="md" show-comment />
              </div>
            </div>
          </div>
        </article>

        <!-- Notes Section -->
        <div class="mt-6 bg-gray-50 rounded-xl p-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-medium text-gray-900">Notes</h2>
          </div>
          <div class="prose prose-sm max-w-none text-gray-600">
            <p>{{ voyage.notes || "No notes available" }}</p>
          </div>
        </div>
      </div>

      <!-- Right Column - Map -->
      <!-- <div class="w-full lg:w-[40%] xl:w-[35%]">
        <div
          class="sticky top-6 h-[400px] sm:h-[500px] lg:h-[550px] rounded-xl overflow-hidden shadow-sm"
        >
          <MapView :location="voyage.location" />
        </div>
      </div> --->
    </div>

    <!-- Options Modal -->
    <ReusableModal :isOpen="isSmallModalOpen" @close="closeModal">
      <div>
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-medium">Voyage Options</h3>
          <button @click="closeModal">
            <CloseIcon fillColor="background100" size="20" />
          </button>
        </div>
        <div>
          <button
            @click="handleEdit()"
            class="w-full flex justify-between items-center py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>Edit Voyage</span>
            <EditIcon size="24" />
          </button>
          <button
            @click="openShareModal"
            class="w-full flex justify-between items-center py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>Share</span>
            <ShareIcon />
          </button>
          <ShareModal
            v-if="isShareModalOpen"
            @close="isShareModalOpen = false"
          />
          <button
            @click="handleDeleteVoyage(voyage!.id)"
            class="w-full flex justify-between items-center py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span>Delete Voyage</span>
            <TrashIcon size="24" fillColor="#dc2626" />
          </button>
        </div>
      </div>
    </ReusableModal>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import UserModal from "@/components/UserModal.vue";
import Rating from "@/components/Rating.vue";

// import MapView from "@/components/MapView.vue";
import ShareModal from "@/components/ShareModal.vue";
import ReusableModal from "@/components/ui/ReusableModal.vue";
import SingleVoyageSkeleton from "@/components/ui/SingleVoyageSkeleton.vue";

// Icons
import VerticalThreeDots from "@/assets/icons/VerticalThreeDots.vue";
import ArrowBack from "@/assets/icons/ArrowBack.vue";
import EditIcon from "@/assets/icons/EditIcon.vue";
import CloseIcon from "@/assets/icons/CloseIcon.vue";
import TrashIcon from "@/assets/icons/TrashIcon.vue";
import LocationIcon from "@/assets/icons/LocationIcon.vue";
import WhatTimeIcon from "@/assets/icons/WhatTimeIcon.vue";
import ShareIcon from "@/assets/icons/ShareIcon.vue";
import Logo from "@/assets/icons/Logo.vue";

import { dateAndTime } from "@/utils/date-and-timeUtils";
import { useVoyageManager } from "@/composables/useVoyageManager";
import { useUserProfile } from "@/composables/useUserProfile";

const { relativeTripDate, relativeCreatedAt } = dateAndTime();

const {
  voyage,
  scrolled,
  isProfileModal,
  isSmallModalOpen,
  isDetailLoading,
  detailError,
  handleFetchSingleVoyage,
  openProfileModal,
  closeProfileModal,
  openOptionsModal,
  handleEdit,
  handleDeleteVoyage,
  closeModal,
} = useVoyageManager();

const { userData } = useUserProfile();
const route = useRoute();

const isShareModalOpen = ref<boolean>(false);

const openShareModal = () => {
  isShareModalOpen.value = true;
};

const loadVoyageData = async () => {
  const id = route.params.id as string;

  if (!id) return;

  isDetailLoading.value = true;
  detailError.value = null;

  try {
    const foundVoyage = await handleFetchSingleVoyage(id);

    if (!foundVoyage) {
      detailError.value = "Voyage not found";
      return;
    }

    voyage.value = foundVoyage;
  } catch (error) {
    detailError.value = "Failed to load voyage";
  } finally {
    isDetailLoading.value = false;
  }
};

onMounted(loadVoyageData);
</script>
