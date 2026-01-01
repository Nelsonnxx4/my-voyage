<template>
  <div class="flex items-center">
    <div :class="[getRatingColor(rating), 'flex']">
      <div v-for="i in 5" :key="'skeleton-' + i">
        <template v-if="i <= Number(rating)">
          <FilledStarIcon size="16" />
        </template>
        <template v-else>
          <SkeletonStarIcon size="16" />
        </template>
      </div>
    </div>

    <span v-if="showComment" class="ml-2 text-sm text-textblack100 font-medium">
      {{ getRatingComment(rating) }}
    </span>
  </div>
</template>
<script setup lang="ts">
import SkeletonStarIcon from "@/assets/icons/SkeletonStarIcon.vue";
import FilledStarIcon from "@/assets/icons/FilledStarIcon.vue";
// import type { Rating } from "@/types/voyage";
import { getRatingColor, getRatingComment } from "@/utils/ratingUtils";

defineOptions({
  name: "VoyageRating",
});

defineProps<{
  rating: 1 | 2 | 3 | 4 | 5;
  showComment?: boolean;
}>();
</script>
