<template>
  <div class="min-h-screen">
    <Header />

    <header class="mt-12 mx-auto px-4 pt-10 md:pt-16">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          About
          <span
            class="bg-gradient-to-br from-accent200 via-accent100 to-accent30 bg-clip-text text-transparent"
            >Zende</span
          >
        </h1>
        <p class="text-base text-gray-600">
          Your personal digital compass for travel planning. Discover, organize,
          and share your journeys in one beautifully simple place.
        </p>
      </div>
    </header>

    <section class="mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold text-center text-gray-900 mb-8">
          Why Choose Zende?
        </h2>

        <div class="grid md:grid-cols-2 gap-4 mb-10">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-4"
            >
              <span class="text-2xl">{{ feature.icon }}</span>
            </div>
            <h3 class="text-xl font-medium text-gray-800 mb-2">
              <span
                v-if="feature.gradientText"
                class="bg-gradient-to-r from-accent100 to-accent50 bg-clip-text text-transparent"
              >
                {{ feature.gradientText }}
              </span>
              {{ feature.title }}
            </h3>
            <p class="text-gray-600">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Choice Section -->
    <section class="bg-gray-50 py-16">
      <div class="mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-2xl font-semibold text-center text-gray-900 mb-4">
            Built with Vue.js & TypeScript
          </h2>
          <p class="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We chose modern technology to give you the best possible experience.
          </p>

          <div class="grid md:grid-cols-2 gap-4">
            <div
              v-for="(feature, index) in techFeatures"
              :key="index"
              class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div class="flex items-center mb-6">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center mr-4"
                >
                  <span class="text-xl">{{ feature.icon }}</span>
                </div>
                <h3 class="text-xl font-medium text-gray-800">
                  {{ feature.title }}
                </h3>
              </div>
              <p class="text-gray-600">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto px-4 py-10">
      <div class="max-w-3xl mx-auto text-center">
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Promise</h2>
          <p class="text-base text-gray-600 mb-6">
            At Zende, we believe travel planning should be as enjoyable as the
            journey itself.
          </p>
          <p class="text-base text-gray-600 mb-10">
            We've stripped away the complexity to give you back the joy of
            discovery.
          </p>
        </div>

        <div
          class="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <router-link
            to="/voyages"
            class="px-8 py-3 bg-accent100 text-white font-medium rounded-lg hover:bg-accent50 transition"
          >
            Start Your Journey
          </router-link>
          <router-link
            to="/"
            class="px-8 py-3 bg-white text-accent100 font-medium rounded-lg border border-accent10 hover:bg-gray-50 transition"
          >
            Learn How It Works
          </router-link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

import { features, techFeatures } from "@/constants/constant";
</script>
