<template>
  <section class="flex justify-center items-center">
    <div v-if="isDetailLoading">
      <EditVoyageSkeleton />
    </div>
    <div v-else-if="detailError">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="handleFetchSingleVoyage(voyageId)"
        class="px-4 py-2 bg-accent50 text-white rounded"
      >
        Retry
      </button>
    </div>
    <main v-else class="bg-background100 py-2 mx-auto px-3 my-5">
      <div class="flex justify-between items-center mb-5">
        <h4 class="text-textblack100">Edit Voyage</h4>
        <CloseIcon
          @click="navigateToVoyage(voyage.id)"
          fillColor="textblack100"
          class="cursor-pointer"
        />
      </div>
      <form @submit.prevent="handleEditVoyage" class="space-y-4">
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
            Free Tier - {{ currentImageCount }}/{{ maxImagesPerEntry }} images
            used

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
            ref="fileInput"
            @change="handleImageUpload"
            accept="image/*"
            class="hidden"
          />

          <!-- Gallery thumbnails -->
          <div v-if="currentImageCount > 0" class="flex gap-2 flex-wrap mb-2">
            <div
              v-for="(thumb, idx) in formData.image_urls"
              :key="idx"
              class="relative w-16 h-16 border rounded overflow-hidden cursor-pointer"
              :class="{ 'ring-2 ring-accent50': activeIndex === idx }"
              @click="selectImage(idx)"
            >
              <img
                :src="thumb"
                class="w-full h-full object-cover"
                alt="Voyage image"
              />
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
              :src="formData.image_urls[activeIndex] || formData.image_urls[0]"
              ref="image"
              :style="imageStyle"
              @load="initCropper"
              class="max-w-full max-h-full object-contain"
              alt="Current voyage image"
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
              alt="Cropped preview"
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

            <div class="flex gap-3">
              <div class="flex-1 relative">
                <input
                  type="text"
                  v-model="locationSearch"
                  @input="searchLocation"
                  placeholder="Search for a city or address"
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-accent50 focus:border-transparent"
                />

                <div v-if="isSearching" class="absolute right-3 top-3">
                  <Spinner />
                </div>
                <ul
                  v-if="locationSuggestions.length > 0"
                  class="absolute z-20 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto"
                >
                  <li
                    v-for="suggestion in locationSuggestions"
                    :key="suggestion.place_id || suggestion.display_name"
                    @click="selectAndPinSuggestion(suggestion)"
                    class="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    {{ suggestion.display_name }}
                  </li>
                </ul>
              </div>

              <button
                type="button"
                @click="useCurrentLocation"
                class="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <LocationIcon size="24" />
                <span class="hidden sm:inline">My Location</span>
              </button>
            </div>
            <MapView />

            <!-- Pin Controls -->
            <div class="mt-3 p-3 bg-gray-50 rounded-lg border">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">
                  Pinned Locations ({{ pins.length }}/{{ maxPinnedLocations }})
                </span>
                <button
                  type="button"
                  @click="pinSelectedLocation"
                  :disabled="!selectedLocation || reachedPinLimit"
                  class="px-3 py-1 text-sm bg-accent50 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent70 transition-colors"
                  :title="
                    reachedPinLimit
                      ? 'Pin limit reached. Upgrade for more pins.'
                      : 'Pin the selected location'
                  "
                >
                  Pin This Spot
                </button>
              </div>

              <div
                v-if="!isPremium && reachedPinLimit"
                class="text-xs text-orange-600 mb-2"
              >
                Free users can pin up to {{ maxPinnedLocations }} locations.
                <button
                  type="button"
                  @click="upgradeToPremium"
                  class="underline font-medium"
                >
                  Upgrade for {{ 8 - maxPinnedLocations }} more pins
                </button>
              </div>
            </div>

            <!-- Pinned List -->
            <div v-if="pins.length" class="mt-2 border rounded p-2 bg-white">
              <div
                v-for="(p, i) in pins"
                :key="i"
                class="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div class="text-sm flex-1">
                  <p class="font-medium truncate max-w-[300px]">
                    {{ p.display_name }}
                  </p>
                  <p class="text-gray-500 text-xs">
                    {{ p.lat.toFixed(4) }}, {{ p.lon.toFixed(4) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="text-red-600 hover:underline text-sm"
                  @click="removePinAt(i)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Date range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label class="block text-textblack100 font-medium mb-1"
                >Date range</label
              >
              <Calendar
                v-model="dateRange"
                selectionMode="range"
                @update:modelValue="handleDateRangeChange"
                :minDate="minSelectableDate"
                :maxDate="maxSelectableDate"
                showIcon
                inputId="dateRange"
                class="w-full mr-2"
                dateFormat="yy-mm-dd"
                :manualInput="false"
                placeholder="Select trip dates"
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
            @click="navigateToVoyage(voyageId)"
            class="px-4 py-2 border rounded text-textblack100 hover:bg-gray-100"
          >
            Cancel
          </button>
          <ReusableButton
            type="submit"
            @click="handleEditVoyage"
            class="px-4 py-2 bg-accent100 hover:bg-accent50 active:bg-accent50 text-white rounded"
            :disabled="isSubmitting || !hasChanges"
            :label="isSubmitting ? 'Saving...' : 'Save Changes'"
          />
        </div>
      </form>
    </main>
  </section>
</template>

<script setup lang="ts">
// imports from vue
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
// imports from PrimeVue
import Editor from "primevue/editor";
import Rating from "primevue/rating";
import Calendar from "primevue/calendar";
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
import LocationIcon from "@/assets/icons/LocationIcon.vue";
// imports from composables/functions/types
import { useVoyageManager } from "@/composables/useVoyageManager";
import { useImageUpload } from "@/composables/useImageUpload";
import { useMap } from "@/composables/useMap";
import { usePremium } from "@/composables/usePremium";
import { genUtils } from "@/utils/genUtils";
import type { LocationSuggestion } from "@/types/mapTypes";
import type { FormDataType } from "@/types/formData";
import { VoyageTypeInfo } from "@/types/voyage";
import { showToast } from "@/utils/showToast";

const route = useRoute();

const {
  voyageId,
  isDetailLoading,
  detailError,
  voyage,
  formData,
  handleFetchSingleVoyage,
  navigateToVoyage,
  handleUpdateVoyage,
} = useVoyageManager();

const { isSubmitting, formatDateForInput, error, upgradeToPremium } =
  genUtils();

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
  selectImage,
  removeImageAt,
  modules,
  handles,
  imageStyle,
  cropBoxStyle,
  cropBox,
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
  isPremium,
  maxImagesPerEntry,
} = useImageUpload(formData);

const { loadUserPlan } = usePremium();

const {
  selectedLocation,
  locationSearch,
  locationSuggestions,
  isSearching,
  pins,
  searchLocation,
  selectSuggestion,
  useCurrentLocation,
  addPin,
  removePinAt,
  maxPinnedLocations,
} = useMap();

// Keep original for diffing
const original = ref<VoyageTypeInfo | null>(null);

// Computed property to track current image count
const currentImageCount = computed(() => {
  return formData.value?.image_urls?.length ?? 0;
});

const hasChanges = computed(() => {
  if (!original.value) return false;

  const updates = buildUpdates();
  return Object.keys(updates).length > 0;
});

const extractImageUrls = (data: any): string[] => {
  if (!data) return [];

  if (Array.isArray(data.image_urls) && data.image_urls.length > 0) {
    return data.image_urls.filter((url: any) => url && typeof url === "string");
  }

  if (typeof data.image_urls === "string" && data.image_urls.trim()) {
    try {
      const parsed = JSON.parse(data.image_urls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((url: any) => url && typeof url === "string");
      }
    } catch (e) {
      console.log("JSON parse failed, treating as single URL");
      return [data.image_urls];
    }
  }

  if (data.image_url && typeof data.image_url === "string") {
    return [data.image_url];
  }

  return [];
};

const load = async () => {
  const id = String(route.params.id);

  try {
    const v = await handleFetchSingleVoyage(id);

    if (!v) {
      error.value = "Failed to load voyage";
      return;
    }
    const imageUrl = extractImageUrls(v);

    original.value = { ...v };

    // Populate form data with fetched voyage info
    formData.value = {
      image_urls: imageUrl,
      title: v.title ?? "",
      location: v.location ?? "",
      start_date: v.start_date ?? "",
      end_date: v.end_date ?? "",
      rating: v.rating ?? 0,
      notes: v.notes ?? "",
      pins: Array.isArray(v.pins) ? [...v.pins] : [],
      latitude: v.latitude ?? null,
      longitude: v.longitude ?? null,
    };

    // Set date range if dates exist
    if (v.start_date && v.end_date) {
      try {
        dateRange.value = [new Date(v.start_date), new Date(v.end_date)];
      } catch (e) {
        console.error("Error parsing dates:", e);
      }
    }

    // Set location if exists
    if (v.location && v.latitude && v.longitude) {
      selectedLocation.value = {
        display_name: v.location,
        lat: v.latitude,
        lon: v.longitude,
      };
      locationSearch.value = v.location;
    }

    // Load existing pins
    if (v.pins && Array.isArray(v.pins)) {
      pins.value = [...v.pins];
    }

    console.log(
      "Loaded voyage with",
      formData.value.image_urls.length,
      "images",
      formData.value.image_urls
    );
  } catch (err) {
    console.error("Error loading voyage:", err);
    error.value = "Failed to load voyage. Please try again.";
  }
};

onMounted(async () => {
  await loadUserPlan();
  await load();
});

const buildUpdates = () => {
  const updates: Partial<FormDataType> & {
    latitude?: number | null;
    longitude?: number | null;
  } = {};

  if (!original.value) return updates;

  // Compare each field
  if (formData.value.title !== original.value.title)
    updates.title = formData.value.title;
  if (formData.value.location !== original.value.location)
    updates.location = formData.value.location;
  if (formData.value.notes !== original.value.notes)
    updates.notes = formData.value.notes;
  if (formData.value.rating !== original.value.rating)
    updates.rating = formData.value.rating;
  if (formData.value.start_date !== original.value.start_date)
    updates.start_date = formData.value.start_date;
  if (formData.value.end_date !== original.value.end_date)
    updates.end_date = formData.value.end_date;

  // Compare image URLs
  const origUrl = original.value.image_urls ?? [];
  const currentUrl = formData.value.image_urls ?? [];
  if (JSON.stringify(currentUrl) !== JSON.stringify(origUrl))
    updates.image_urls = currentUrl;

  // Compare coordinates
  if (formData.value.latitude !== (original.value.latitude ?? null))
    updates.latitude = formData.value.latitude;
  if (formData.value.longitude !== (original.value.longitude ?? null))
    updates.longitude = formData.value.longitude;

  // Compare pins
  const origPins = original.value.pins ?? [];
  if (JSON.stringify(pins.value) !== JSON.stringify(origPins))
    updates.pins = pins.value;

  return updates;
};

const reachedPinLimit = computed(
  () => pins.value.length >= maxPinnedLocations.value
);

// Auto-pin when selecting suggestion
const selectAndPinSuggestion = (suggestion: LocationSuggestion) => {
  selectSuggestion(suggestion);

  // Auto-pin the selected location if not at limit
  if (!reachedPinLimit.value) {
    setTimeout(() => {
      pinSelectedLocation();
    }, 100);
  }
};

const pinSelectedLocation = () => {
  if (!selectedLocation.value) return;

  const success = addPin(selectedLocation.value);
  if (!success && reachedPinLimit.value) {
    showToast("Pin limit reached. Upgrade for more pins.", "warning");
  }
};

const handleEditVoyage = async () => {
  if (!voyageId.value) return;

  isSubmitting.value = true;
  try {
    const updates = buildUpdates();

    if (Object.keys(updates).length === 0) {
      showToast("No changes detected", "info");
      navigateToVoyage(voyageId.value);
      return;
    }

    const updated = await handleUpdateVoyage(voyageId.value, {
      ...formData.value,
      ...updates,
    });

    if (updated) {
      showToast("Voyage updated successfully!", "success");
      navigateToVoyage(voyageId.value);
    }
  } catch (err) {
    console.error("Error updating voyage:", err);
    showToast("Failed to update voyage. Please try again.", "error");
  } finally {
    isSubmitting.value = false;
  }
};

// Watch pins for changes
watch(
  pins,
  (nv) => {
    formData.value.pins = nv;
  },
  { deep: true }
);

interface DateRange extends Array<Date> {
  0: Date;
  1: Date;
}
const dateRange = ref<DateRange | null>(null);

const handleDateRangeChange = (range: DateRange | null) => {
  if (range && range.length === 2) {
    formData.value.start_date = formatDateForInput(range[0]);
    formData.value.end_date = formatDateForInput(range[1]);
  } else {
    formData.value.start_date = "";
    formData.value.end_date = "";
  }
};

// Date constraints
const minSelectableDate = computed(() => new Date());
const maxSelectableDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
});

// Watch for location changes and update form data
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
