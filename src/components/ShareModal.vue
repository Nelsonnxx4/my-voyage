<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
      <!-- Header -->
      <div class="p-6 pb-4 border-b">
        <header class="flex justify-between items-center mb-2">
          <div class="w-min p-4 bg-gray-100 rounded-full">
            <ShareIcon />
          </div>
          <button @click="$emit('close')" aria-label="Close">
            <CloseIcon fillColor="#6b7280" size="20" />
          </button>
        </header>
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Share with Friends</h2>
            <p class="text-sm text-gray-500 mt-1">Share your amazing journey</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-6">
        <!-- Link Copy Section -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Share your link</label
          >
          <div class="flex rounded-md shadow-sm">
            <input
              ref="urlInput"
              v-model="pageUrl"
              readonly
              class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              @click="selectUrlText"
            />
            <button
              @click="copyLink"
              class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <CopyIcon v-if="!isCopied" />
              <CopiedIcon v-else />
            </button>
          </div>
        </div>

        <!-- PDF Download Button -->
        <div class="mb-6">
          <button
            @click="handleDownloadPdf"
            :disabled="isExporting"
            :class="[
              'w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-md shadow-sm text-sm font-medium transition-colors',
              canExportPdf
                ? 'bg-accent100 text-white hover:bg-accent200'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed relative group',
            ]"
          >
            <DownloadIcon :fillColor="canExportPdf ? '#fff' : '#6b7280'" />
            <span>{{
              isExporting ? "Generating PDF..." : "Export as PDF"
            }}</span>

            <!-- Premium badge for free users -->
            <PremiumIcon
              v-if="!canExportPdf"
              fillColor="#f59e0b"
              size="16"
              class="ml-1"
            />

            <!-- Tooltip for free users -->
            <div
              v-if="!canExportPdf"
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
            >
              Premium feature - Upgrade to export PDFs
              <div
                class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1"
              >
                <div
                  class="border-4 border-transparent border-t-gray-800"
                ></div>
              </div>
            </div>
          </button>
        </div>

        <!-- Social Share Buttons -->
        <div>
          <p class="text-sm font-medium text-gray-700 mb-3">Share to</p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="platform in platforms"
              :key="platform.socialMedia"
              @click="share(platform)"
              class="flex justify-center items-center flex-col group"
              :aria-label="`Share on ${platform.socialMedia}`"
            >
              <div
                class="p-3 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors"
              >
                <img
                  :src="platform.icon"
                  :alt="platform.socialMedia"
                  class="w-6 h-6"
                />
              </div>
              <span
                class="text-xs text-gray-500 mt-2 hidden sm:inline-block capitalize"
              >
                {{ platform.socialMedia }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ShareIcon from "@/assets/icons/ShareIcon.vue";
import CloseIcon from "@/assets/icons/CloseIcon.vue";
import CopyIcon from "@/assets/icons/CopyIcon.vue";
import CopiedIcon from "@/assets/icons/CopiedIcon.vue";
import DownloadIcon from "@/assets/icons/DownloadIcon.vue";
import PremiumIcon from "@/assets/icons/PremiumIcon.vue";
import type { Platform } from "@/types/social";
import { platforms } from "@/constants/constant";
import { usePdfExport } from "@/composables/usePdfExport";
import { useToast } from "@/composables/useToast";

interface Props {
  contentElementId?: string;
  defaultFilename?: string;
}

const props = withDefaults(defineProps<Props>(), {
  contentElementId: "journal-content",
  defaultFilename: "my-voyage",
});

const emit = defineEmits(["close"]);

import { computed } from "vue";
const { exportToPdf, canExport } = usePdfExport();
const canExportPdf = computed(() => canExport());
const { addToast } = useToast();

const urlInput = ref<HTMLInputElement | null>(null);
const pageUrl = ref(window.location.href);
const isCopied = ref(false);
const isExporting = ref(false);

const selectUrlText = () => {
  if (urlInput.value) {
    urlInput.value.select();
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(pageUrl.value);
    isCopied.value = true;
    addToast("Link copied to clipboard!", { type: "success" });
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
    addToast("Failed to copy link", { type: "error" });
    selectUrlText();
  }
};

const handleDownloadPdf = async () => {
  if (!canExportPdf.value) {
    return;
  }

  isExporting.value = true;
  try {
    await exportToPdf(props.contentElementId, props.defaultFilename);
    emit("close");
  } catch (error) {
    console.error("PDF export failed:", error);
  } finally {
    isExporting.value = false;
  }
};

const share = (platform: Platform) => {
  const shareUrl = new URL(pageUrl.value);
  const shareText = "Check out my travel journal!";
  let url = "";

  switch (platform.socialMedia) {
    case "facebook":
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl.toString()
      )}`;
      break;
    case "x":
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl.toString()
      )}&text=${encodeURIComponent(shareText)}`;
      break;
    case "whatsapp":
      url = `https://wa.me/?text=${encodeURIComponent(
        `${shareText}: ${shareUrl.toString()}`
      )}`;
      break;
    case "linkedin":
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl.toString()
      )}`;
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  window.open(url, "_blank", "noopener,noreferrer");
  addToast(`Sharing to ${platform.socialMedia}...`, { type: "info" });
};
</script>
