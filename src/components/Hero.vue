<template>
  <main class="mt-20 py-6">
    <!-- Hero -->
    <section
      class="max-w-3xl xl:max-w-4xl mx-auto md:my-10 xl:pt-16 px-4 sm:px-6 lg:px-8 text-center"
    >
      <h1
        class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight"
      >
        A travel journal that works like a
        <span
          class="inline-block px-2 bg-accent50/20 rounded-2xl text-accent100"
          >companion</span
        >
      </h1>
      <p class="mt-5 max-w-2xl mx-auto text-gray-600 text-lg">
        Plan voyages, pin locations, save photos, and export memories. Keep
        everything about your journeys in one delightful place.
      </p>
      <div class="mt-8 mb-16 flex items-center justify-center gap-3">
        <router-link
          to="/signup"
          class="px-5 py-3 rounded-full bg-black text-white shadow hover:bg-gray-800"
        >
          Get Started
        </router-link>
        <!-- <router-link
          to="/pricing"
          class="px-5 py-3 rounded-full bg-white border shadow-sm hover:bg-gray-50"
        >
          View Plans
        </router-link> -->
      </div>
    </section>

    <!-- social media proof -->

    <section class="flex flex-col justify-center items-center">
      <span class="font-medium">Supported by </span>

      <div class="flex justify-between items-center gap-3 md:gap-5 my-3">
        <FacebookIcon />
        <WhatsAppIcon />
        <XIcon />
        <LinkedInIcon />
      </div>
    </section>

    <!-- Logo row -->
    <!-- <div
        class="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center text-gray-400"
      >
        <div class="h-10 bg-gray-100 rounded"></div>
        <div class="h-10 bg-gray-100 rounded"></div>
        <div class="h-10 bg-gray-100 rounded"></div>
        <div class="h-10 bg-gray-100 rounded"></div>
        <div class="h-10 bg-gray-100 rounded"></div>
        <div class="h-10 bg-gray-100 rounded"></div>
      </div> -->

    <!-- How it works -->
    <section
      id="howItWorks"
      class="max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20"
    >
      <h2
        class="text-xl pb-8 md:text-2xl font-semibold text-gray-900 text-center"
      >
        How it works
      </h2>
      <div class="my-8">
        <picture class="flex flex-col justify-center items-center md:hidden">
          <img
            src="@/assets/images/Zende_Emty_mobile.png"
            alt="empty state diagram"
            class="w-[80%] rotate-6"
          />

          <!-- arrow down -->
          <img
            src="@/assets/images/arrow-down-right.png"
            alt="arrow down"
            class="-mt-6 w-[50%]"
          />

          <!-- create entry -->
          <img
            src="@/assets/images/Zende_create_mobile.png"
            alt="create"
            class="w-[80%] -rotate-6"
          />

          <!-- arrow down -->
          <img
            src="@/assets/images/arrow-down-right.png"
            alt="arrow down"
            class="-mt-4 w-[50%]"
          />

          <!--  voyage view -->
          <img
            src="@/assets/images/Zende_voyage_view_mobile.png"
            alt="create"
            class="w-[80%] -rotate-6"
          />
        </picture>

        <!-- desktop -->

        <picture class="md:flex flex-col justify-center items-center hidden">
          <img
            src="@/assets/images/Zende_Empty_desktop.png"
            alt="Empty state"
          />

          <!-- arrow down -->
          <img
            src="@/assets/images/arrow-down-right.png"
            alt="arrow down"
            class="-mt-6 w-[50%]"
          />

          <!-- Create -->
          <img
            src="@/assets/images/Zende_create_desktop.png"
            alt="Create voyage page"
            class="w-full rotate-6"
          />

          <!-- arrow down -->
          <img
            src="@/assets/images/arrow-down-right.png"
            alt="arrow down"
            class="-mt-6 w-[50%] rotate-12"
          />

          <!--  voyage view -->
          <img
            src="@/assets/images/Zende_voyage_view_desktop.png"
            alt="create"
            class="w-[90%] -rotate-6"
          />
        </picture>

        <div
          class="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 leading-6 text-base"
        >
          <div
            class="bg-white rounded-xl p-6 shadow text-center border border-dashed border-slate-500 -rotate-3"
          >
            <h4 class="font-semibold">1. Add Photos</h4>
            <p class="text-gray-600 mt-2 leading-5">
              Upload images and crop them perfectly
            </p>
          </div>
          <div
            class="bg-white rounded-xl p-6 shadow text-center border border-dashed border-slate-500 rotate-3"
          >
            <h4 class="font-semibold">2. Pin Locations</h4>
            <p class="text-gray-600 mt-2 leading-5">
              Drop pins on the map where you’ve been.
            </p>
          </div>
          <div
            class="bg-white rounded-xl p-6 shadow text-center border border-dashed border-slate-500 -rotate-3"
          >
            <h4 class="font-semibold leading-6">
              3. Click <span class="text-accent100"> "Create Voyage" </span>
            </h4>
            <p class="text-gray-600 mt-2 leading-5">
              Give it a title, notes and dates.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quote -->
    <!-- <div class="mt-10 max-w-xl mx-auto text-center text-gray-600">
        <img alt="" class="mx-auto w-10 h-10 rounded-full mb-2" />
        <h4 class="font-medium text-gray-900">Quick and Easy Setup</h4>
        <p class="text-sm mt-1">
          "We scaled to thousands of voyage entries. The dashboard is the only
          thing that keeps us sane."
        </p>
      </div> -->

    <!-- Benefits -->
    <section
      id="benefits"
      class="flex flex-col justify-center items-center w-full md:max-w-xl xl:max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 my-16 text-center"
    >
      <span class="text-xs uppercase tracking-wide text-gray-500"
        >Branding</span
      >
      <h3
        class="text-xl md:text-2xl font-semibold text-gray-900 mt-2 leading-6"
      >
        Customize the full experience
      </h3>
      <p class="text-gray-600 max-w-2xl mx-auto mt-2">
        From voyage pages to PDFs, your adventures always look like you. Plus
        you get share your Journey on
        <span
          class="bg-gradient-to-br from-accent100 to-accent30 text-transparent bg-clip-text text-lg italic"
        >
          Social Media
        </span>
      </p>
      <div class="mt-5 flex flex-wrap gap-2 justify-center">
        <button class="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
          Memories
        </button>
        <button class="px-3 py-1 rounded-full bg-black text-white">
          Journal
        </button>
        <button class="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
          Map
        </button>
        <button class="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
          PDF
        </button>
      </div>

      <div class="mt-10 text-left xl:w-[80%] bg-white rounded-2xl p-6 shadow">
        <h3 class="text-xl font-semibold">Photos That Feel Like You</h3>
        <ul class="mt-3 space-y-2 text-gray-600 text-base list-disc">
          <li>Add to your socials</li>
          <li>Write personal notes and stories</li>
          <li>Pin locations you visit</li>
          <li>Export to PDF and share</li>
        </ul>
      </div>
    </section>

    <!-- Pricing -->

    <section
      id="pricing"
      class="flex flex-col lg:flex-row justify-center items-center gap-2 my-28 px-4"
    >
      <PricingCards />
    </section>

    <!-- Compare / Pricing CTA -->
    <section
      id="issues"
      class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center"
    >
      <h3 class="text-xl md:text-2xl font-semibold text-gray-900">
        Rating/Questions
      </h3>

      <p class="text-gray-600 max-w-2xl mx-auto mt-2">
        Use it and rate it, maybe you could be among the top users. Having any
        issues or questions? click the word
        <router-link to="/issues" class="italic text-accent100 underline">
          "link"
        </router-link>
      </p>

      <!-- <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
        Free vs Premium
      </h2> -->
      <!-- <p class="text-gray-600 max-w-2xl mx-auto mt-2">
        Free gives you the basics. Premium unlocks more images, unlimited pins,
        more entries and PDF export.
      </p> -->
      <!-- <div class="mt-6 flex items-center justify-center gap-3">
        <router-link
          to="/signup"
          class="px-5 py-3 rounded-full bg-black text-white hover:bg-gray-800"
          >Start Free</router-link
        >
        <router-link
          to="/pricing"
          class="px-5 py-3 rounded-full bg-white border hover:bg-gray-50"
          >See Premium</router-link
        >
      </div> -->
    </section>

    <!-- FAQs CTA anchor -->
    <!-- <section
      id="faqs"
      class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center"
    >
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
        Got questions?
      </h2>
      <p class="text-gray-600 mt-2">
        Visit our pricing page for details or contact support.
      </p>
      <router-link
        to="/pricing"
        class="inline-block mt-4 px-4 py-2 rounded-full bg-accent100 text-white hover:bg-accent50"
        >Go to Pricing</router-link
      >
    </section> -->

    <section id="faqs" class="px-2">
      <FAQs />
    </section>
  </main>
</template>

<script setup lang="ts">
import FAQs from "@/components/FAQs.vue";
import PricingCards from "@/components/PricingCards.vue";

// icons
import FacebookIcon from "@/assets/icons/FacebookIcon.vue";
import WhatsAppIcon from "@/assets/icons/WhatsAppIcon.vue";
import XIcon from "@/assets/icons/XIcon.vue";
import LinkedInIcon from "@/assets/icons/LinkedInIcon.vue";
</script>
