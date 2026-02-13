<template>
  <section class="flex justify-center items-center">
    <div v-if="isDetailLoading">
      <EditVoyageSkeleton />
    </div>
    <main v-else class="bg-background100 py-2 mx-auto px-3 my-5">
      <div class="flex justify-between items-center mb-5">
        <h4 class="text-textblack100">Create New Voyage</h4>
        <CloseIcon
          @click="navigateToVoyages"
          fillColor="textblack100"
          class="cursor-pointer"
        />
      </div>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- Image Section -->
        <div class="space-y-2 relative">
          <div
            v-if="isPremium"
            class="premium-badge bg-accent50 text-white px-3 py-1 rounded-lg text-sm"
          >
            <i class="fas fa-crown"></i>
            Premium - Up to {{ maxImagesPerEntry }} images per voyage
          </div>
          <div
            v-else
            class="free-tier-info bg-gray-100 px-3 py-2 rounded-lg text-sm"
          >
            Free Tier - {{ formData.image_urls.length }}/{{ maxImagesPerEntry }}
            images used

            <button
              type="button"
              @click="upgradeToPremium"
              class="upgrade-btn underline text-accent100 ml-2"
            >
              Upgrade for {{ 8 - maxImagesPerEntry }} more images
            </button>
          </div>
          <input
            type="file"
            :ref="(el) => { fileInput = el as HTMLInputElement | null }"
            @change="handleImageUpload"
            accept="image/*"
            class="hidden"
          />

          <!-- Gallery thumbnails -->
          <div
            v-if="formData.image_urls.length"
            class="flex gap-2 flex-wrap mb-2"
          >
            <div
              v-for="(thumb, idx) in formData.image_urls"
              :key="idx"
              class="relative w-16 h-16 border rounded overflow-hidden cursor-pointer"
              :class="{ 'ring-2 ring-accent50': activeIndex === idx }"
              @click="selectImage(idx)"
            >
              <img :src="thumb" class="w-full h-full object-cover" />
              <button
                type="button"
                class="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs"
                @click.stop="removeImageAt(idx)"
                title="Remove"
              >
                ×
              </button>
            </div>
            <button
              v-if="canAddMoreImages"
              type="button"
              @click="openFileInput"
              class="w-16 h-16 border-dashed border-2 border-gray-300 text-gray-400 rounded flex items-center justify-center hover:border-accent50 hover:text-accent50 transition-colors"
              title="Add image"
            >
              +
            </button>
          </div>

          <!-- Action Buttons -->
          <div v-if="showActionButtons" class="flex gap-2 mb-2">
            <button
              type="button"
              @click="cropImage"
              class="flex md:justify-between items-center gap-1 px-2 bg-accent50 text-white rounded-md hover:bg-accent70 transition-colors"
            >
              <CropIcon size="24" fillColor="#fff" />
              <span class="hidden md:block"> Crop </span>
            </button>
            <button
              type="button"
              @click="rotate(-90)"
              class="flex md:justify-between items-center gap-1 px-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RotateLeft size="24" />
              <span class="hidden md:block"> Rotate Left </span>
            </button>
            <button
              type="button"
              @click="rotate(90)"
              class="flex md:justify-between items-center gap-1 px-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RotateRight size="24" />
              <span class="hidden md:block"> Rotate Right </span>
            </button>
            <div
              v-if="hasImage"
              @click.prevent="deleteSelectedImage"
              class="px-4 py-2 bg-red-600 rounded-md hover:bg-red-500 transition-colors cursor-pointer"
            >
              <TrashIcon fillColor="#fff" size="24" />
            </div>
          </div>

          <!-- Main Image Container -->
          <div
            class="h-64 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden"
            :class="{
              'border-2 border-dashed border-accent50': !hasImage,
              'border border-gray-200': hasImage,
            }"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            v-if="true"
            v-bind="!hasImage ? { onClick: openFileInput } : {}"
          >
            <!-- Loading State -->
            <div
              v-if="isImgLoading"
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-20"
            >
              <Spinner class="w-8 h-8 text-accent50" />
            </div>

            <!-- Drag Overlay -->
            <div
              v-if="dragOver && !isImgLoading"
              class="absolute inset-0 flex items-center justify-center bg-accent50 bg-opacity-10 border-2 border-dashed border-accent50 z-10"
            >
              <div class="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span class="text-accent50 font-medium">Drop image here</span>
              </div>
            </div>

            <!-- Original Image Preview -->
            <img
              v-if="showOriginalImage"
              :src="formData.image_urls[activeIndex]"
              ref="image"
              :style="imageStyle"
              @load="initCropper"
              class="max-w-full max-h-full object-contain"
            />

            <!-- Crop Box (only visible when editing original) -->
            <div
              v-if="showCropBox"
              ref="cropBox"
              class="absolute border-2 border-[#3bc159] border-dashed shadow-lg"
              :style="cropBoxStyle"
              @mousedown="startDrag"
            >
              <div
                v-for="handle in typedHandles"
                :key="handle"
                class="absolute w-3 h-3 bg-white border border-accent50 rounded-full"
                :class="handleClasses[handle]"
                @mousedown.stop="startResize($event, handle)"
              />
            </div>

            <!-- Cropped Preview -->
            <img
              v-if="showCroppedImage"
              :src="croppedImage"
              class="w-full h-full object-cover"
            />

            <!-- Empty State -->
            <template v-if="showEmptyState">
              <div class="flex flex-col items-center text-gray-400">
                <EditIcon class="w-6 h-6 mb-2" />
                <span>Drag & drop or click to upload</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Title and Location -->
        <div>
          <ReusableInput
            label="Title"
            type="text"
            v-model="formData.title"
            placeholder="A weekend in Monaco"
          />

          <div class="space-y-2">
            <label class="block text-textblack100 font-medium">Location</label>

            <!-- <div class="flex-1 relative">
              <input
                type="text"
                v-model="locationSearch"
                @input="searchLocation"
                placeholder="Search for a city or address"
                class="w-full p-2 border rounded focus:ring-2 focus:ring-accent50 focus:border-transparent"
              />
            </div> -->

            <MapView
              v-model="selectedLocation"
              map-height="400px"
              :initial-zoom="13"
            />
          </div>

          <!-- Date range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label class="block text-textblack100 font-medium mb-1"
                >Start Date</label
              >
              <input
                type="date"
                v-model="formData.start_date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent50 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-textblack100 font-medium mb-1"
                >End Date</label
              >
              <input
                type="date"
                v-model="formData.end_date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent50 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Rating -->
          <div>
            <label class="block text-textblack100 font-medium mb-1"
              >Rating</label
            >
            <div class="flex space-x-1">
              <div class="flex justify-center">
                <Rating
                  v-model="formData.rating"
                  :stars="5"
                  class="custom-rating"
                />
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="py-3">
            <label class="block text-textblack100 font-medium mb-1"
              >Notes</label
            >
            <div class="border bg-white">
              <Editor
                v-model="formData.notes"
                editorStyle="height: 220px"
                :modules="modules"
              />
            </div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="navigateToVoyages"
            class="px-4 py-2 border rounded text-textblack100 hover:bg-gray-100"
          >
            Cancel
          </button>
          <ReusableButton
            type="submit"
            class="px-4 py-2 bg-accent100 hover:bg-accent50 active:bg-accent50 text-white rounded"
            :disabled="isSubmitting || !canSubmit"
            :label="isSubmitting ? 'Creating...' : 'Create Voyage'"
          />
        </div>
      </form>
    </main>
  </section>
</template>

<script setup lang="ts">
// imports from vue
import { computed, onMounted, ref, watch } from "vue";
// imports from PrimeVue
import Editor from "primevue/editor";
import Rating from "primevue/rating";
// import Calendar from "primevue/calendar";
// imports from ui components
import EditVoyageSkeleton from "@/components/ui/EditVoyageSkeleton.vue";
import ReusableButton from "@/components/ui/ReusableButton.vue";
import ReusableInput from "@/components/ui/ReusableInput.vue";
import Spinner from "@/components/ui/Spinner.vue";
import MapView from "@/components/MapView.vue";
// imports from icons
import EditIcon from "@/assets/icons/EditIcon.vue";
import CloseIcon from "@/assets/icons/CloseIcon.vue";
import TrashIcon from "@/assets/icons/TrashIcon.vue";
import CropIcon from "@/assets/icons/CropIcon.vue";
import RotateRight from "@/assets/icons/RotateRight.vue";
import RotateLeft from "@/assets/icons/RotateLeft.vue";
// import LocationIcon from "@/assets/icons/LocationIcon.vue";
// imports from composables/functions/types
import { useVoyageManager } from "@/composables/useVoyageManager";
import { useImageUpload } from "@/composables/useImageUpload";
// import { useMap } from "@/composables/useMap";
import { usePremium } from "@/composables/usePremium";
import { genUtils } from "@/utils/genUtils";
// import type { LocationSuggestion } from "@/types/mapTypes";
// import { setupStorageBucket } from "@/utils/storageSetup";

const {
  isDetailLoading,
  navigateToVoyages,
  handleCreateVoyage,
  formData,
  voyages,
} = useVoyageManager();

const { isSubmitting, upgradeToPremium } = genUtils();

const {
  rotate,
  initCropper,
  startDrag,
  startResize,
  cropImage,
  handleDrop,
  openFileInput,
  handleImageUpload,
  handleDragOver,
  handleDragLeave,
  deleteSelectedImage,
  uploadImagesToSupabase,
  selectImage,
  removeImageAt,
  modules,
  handles,
  imageStyle,
  cropBoxStyle,
  // cropBox,
  croppedImage,
  dragOver,
  fileInput,
  isImgLoading,
  hasImage,
  showActionButtons,
  showOriginalImage,
  showCropBox,
  showCroppedImage,
  showEmptyState,
  activeIndex,
  canAddMoreImages,
  tempImages,
  isPremium,
  maxImagesPerEntry,
} = useImageUpload(formData);

const { limits, loadUserPlan } = usePremium();

const selectedLocation = ref<any>(null);

// Watch location selection
watch(selectedLocation, (newLocation) => {
  if (newLocation) {
    formData.value.location = newLocation.display_name;
    formData.value.latitude = newLocation.lat;
    formData.value.longitude = newLocation.lon;
  } else {
    formData.value.location = "";
    formData.value.latitude = null;
    formData.value.longitude = null;
  }
});

onMounted(async () => {
  await loadUserPlan();
  // Set loading to false since create page doesn't need to load data
  isDetailLoading.value = false;
  // // const isStorageReady = await setupStorageBucket();
  // if (!isStorageReady) {
  //   console.warn("Storage bucket not configured");
  // }
});

// Check if voyage limit reached
const canCreateVoyage = computed(() => {
  return voyages.value.length < limits.maxVoyageEntries;
});

const canSubmit = computed(() => {
  return (
    formData.value.title.trim() &&
    formData.value.location.trim() &&
    formData.value.start_date &&
    formData.value.end_date &&
    canCreateVoyage.value
  );
});

const onSubmit = async () => {
  if (!canCreateVoyage.value) {
    upgradeToPremium();
    return;
  }

  try {
    const uploadedImageUrls = await uploadImagesToSupabase();

    if (uploadedImageUrls.length === 0 && tempImages.value.length > 0) {
      throw new Error("Image upload failed. Please try again.");
    }

    const voyageData = {
      ...formData.value,
      image_urls: uploadedImageUrls,
      // pins: pins.value,
    };

    await handleCreateVoyage(voyageData);
  } catch (error) {
    console.error("Error creating voyage:", error);
  }
};

// const reachedPinLimit = computed(
//   () => pins.value.length >= maxPinnedLocations.value
// );

// // Auto-pin when selecting suggestion
// const selectAndPinSuggestion = (suggestion: LocationSuggestion) => {
//   selectSuggestion(suggestion);

//   // Auto-pin the selected location if not at limit
//   if (!reachedPinLimit.value) {
//     setTimeout(() => {
//       pinSelectedLocation();
//     }, 100);
//   }
// };

// const pinSelectedLocation = () => {
//   if (!selectedLocation.value) return;

//   const success = addPin(selectedLocation.value);
//   if (!success && reachedPinLimit.value) {
//     // Show message about limit
//     console.warn("Pin limit reached");
//   }
// };

// watch(pins, (nv) => {
//   formData.value.pins = nv;
// });

// interface DateRange extends Array<Date> {
//   0: Date;
//   1: Date;
// }
// const dateRange = ref<DateRange | null>(null);

// const handleDateRangeChange = (range: DateRange | null) => {
//   if (range && range.length === 2) {
//     formData.value.start_date = formatDateForInput(range[0]);
//     formData.value.end_date = formatDateForInput(range[1]);
//   } else {
//     formData.value.start_date = "";
//     formData.value.end_date = "";
//   }
// };
// Date constraints
// const minSelectableDate = computed(() => Date());
// const maxSelectableDate = computed(() => {
//   const date = new Date();
//   date.setFullYear(date.getFullYear() + 1);
//   return date;
// });
// watch(selectedLocation, (newLocation) => {
//   if (newLocation) {
//     formData.value.location = newLocation.display_name;
//     formData.value.latitude = newLocation.lat;
//     formData.value.longitude = newLocation.lon;
//   } else {
//     formData.value.location = "";
//     formData.value.latitude = null;
//     formData.value.longitude = null;
//   }
// });

const typedHandles = handles as HandleKey[];
// Add handleClasses mapping for crop handles
type HandleKey =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right";

const handleClasses: Record<HandleKey, string> = {
  "top-left": "top-0 left-0 cursor-nwse-resize",
  "top-right": "top-0 right-0 cursor-nesw-resize",
  "bottom-left": "bottom-0 left-0 cursor-nesw-resize",
  "bottom-right": "bottom-0 right-0 cursor-nwse-resize",
  top: "top-0 left-1/2 -translate-x-1/2 cursor-ns-resize",
  bottom: "bottom-0 left-1/2 -translate-x-1/2 cursor-ns-resize",
  left: "left-0 top-1/2 -translate-y-1/2 cursor-ew-resize",
  right: "right-0 top-1/2 -translate-y-1/2 cursor-ew-resize",
};
</script>

<style scoped>
::deep(.custom-rating .p-rating-icon) {
  color: #fbbf24;
  transition: color 0.2s;
}

::deep(.custom-rating .p-rating-icon.p-rating-icon-active) {
  color: #fbbf24;
}

::deep(.custom-rating .p-rating-icon:hover) {
  color: #fbbf24;
}
</style>
