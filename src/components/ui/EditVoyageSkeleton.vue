<template>
  <main
    class="bg-background100 py-2 mx-auto px-3 my-5 min-w-[300px] sm:min-w-[400px] md:min-w-[450px]"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-5">
      <USkeleton class="h-6 w-40 base bg-skeleton" />
      <USkeleton class="h-6 w-6 base bg-skeleton" />
    </div>

    <div class="space-y-4">
      <!-- Main Image Container -->
      <USkeleton class="h-64 rounded-lg w-full base bg-skeleton" />

      <!-- Title -->
      <div>
        <USkeleton class="h-4 w-16 base mb-1 bg-skeleton" />
        <USkeleton class="h-10 w-full base rounded bg-skeleton" />
      </div>

      <!-- Location Section -->
      <div class="space-y-2">
        <USkeleton class="h-4 w-20 base bg-skeleton" />
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <USkeleton class="h-10 w-full base rounded bg-skeleton" />
          </div>
          <USkeleton class="h-10 w-full sm:w-32 base rounded bg-skeleton" />
        </div>

        <!-- Map View -->
        <USkeleton class="h-64 w-full base rounded mt-2 bg-skeleton" />

        <!-- Selected Location -->
        <div class="p-3 rounded-lg border bg-skeleton">
          <div class="flex justify-between items-start">
            <div class="w-full">
              <USkeleton class="h-5 w-3/4 base mb-2 bg-skeleton-200" />
              <USkeleton class="h-4 w-full base bg-skeleton-200" />
            </div>
            <USkeleton class="h-4 w-4 base bg-skeleton-200" />
          </div>
        </div>
      </div>

      <!-- Date Range and Rating Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <!-- Date Range -->
        <div>
          <USkeleton class="h-4 w-24 base mb-1 bg-skeleton" />
          <USkeleton class="h-10 w-full base rounded bg-skeleton" />
        </div>

        <!-- Rating -->
        <div>
          <USkeleton class="h-4 w-20 base mb-1 bg-skeleton" />
          <div class="flex space-x-1">
            <USkeleton class="h-6 w-6 base rounded-full bg-skeleton" />

            <USkeleton
              class="h-6 w-6 base rounded-full bg-skeleton"
            /><USkeleton
              class="h-6 w-6 base rounded-full bg-skeleton"
            /><USkeleton
              class="h-6 w-6 base rounded-full bg-skeleton"
            /><USkeleton
              class="h-6 w-6 base rounded-full bg-skeleton"
            /><USkeleton class="h-6 w-6 base rounded-full bg-skeleton" />
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="py-3">
        <USkeleton class="h-4 w-20 base mb-1 bg-skeleton" />
        <USkeleton class="h-[220px] w-full base rounded bg-skeleton" />
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <USkeleton class="h-10 w-full sm:w-24 base rounded bg-skeleton" />
        <USkeleton class="h-10 w-full sm:w-36 base rounded bg-skeleton" />
      </div>
    </div>
  </main>
</template>
