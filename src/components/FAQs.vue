<template>
  <div class="w-full max-w-3xl mx-auto mt-16 mb-10 text-center">
    <h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
      Frequently Asked Questions
    </h2>
    <p class="text-gray-600 mb-8">
      Find answers to common questions about our travel journal plans and
      features.
    </p>

    <div class="space-y-4">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <button
          @click="toggleFaq(index)"
          class="w-full p-6 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
        >
          <h3 class="text-lg font-medium md:font-semibold text-gray-900">
            {{ faq.question }}
          </h3>
          <span class="text-gray-500 ml-4">
            {{ openFaq === index ? "−" : "+" }}
          </span>
        </button>

        <div v-if="openFaq === index" class="px-6 pb-6 pt-2 bg-white">
          <p class="text-gray-600">
            {{ faq.answer }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { faqs } from "@/constants/constant";
import { ref } from "vue";

const openFaq = ref<number | null>(null);

const toggleFaq = (index: number | null) => {
  openFaq.value = openFaq.value === index ? null : index;
};
</script>
