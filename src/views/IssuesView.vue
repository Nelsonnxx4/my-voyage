<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
        <p class="text-gray-600">
          Found a bug or having trouble? Let us know so we can help!
        </p>
      </div>

      <!-- Progress Steps (Optional)
      <div class="flex items-center justify-center mb-10">
        <div class="flex items-center">
          <div
            class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center"
          >
            1
          </div>
          <div class="w-20 h-1 bg-blue-600"></div>
          <div
            class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center"
          >
            2
          </div>
          <div class="w-20 h-1 bg-gray-300"></div>
          <div
            class="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center"
          >
            3
          </div>
        </div>
      </div> -->

      <!-- Issue Form -->
      <div class="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <form @submit.prevent="submitIssue">
          <!-- Issue Type -->
          <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              What type of issue are you facing?
            </label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                type="button"
                v-for="type in issueTypes"
                :key="type.id"
                @click="selectIssueType(type.id)"
                :class="[
                  'p-4 rounded-lg border text-center transition-all',
                  selectedType === type.id
                    ? 'border-accent100 bg-accent10/30'
                    : 'border-gray-200 hover:border-gray-300',
                ]"
              >
                <div class="text-2xl mb-2">{{ type.icon }}</div>
                <div class="text-sm font-medium">{{ type.label }}</div>
              </button>
            </div>
          </div>

          <!-- Title -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Brief description
            </label>
            <input
              type="text"
              v-model="form.title"
              placeholder="e.g., Photos not uploading"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          <!-- Description -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Please describe the issue in detail
            </label>
            <textarea
              v-model="form.description"
              rows="5"
              placeholder="Tell us what happened, steps to reproduce, and what you expected to happen..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              required
            ></textarea>
          </div>

          <!-- Upload Screenshot (Optional) -->
          <!-- <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Add a screenshot (optional)
            </label>
            <div
              @click="triggerFileInput"
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              <div class="text-4xl text-gray-400 mb-2">📸</div>
              <p class="text-gray-600 mb-2">Click to upload screenshot</p>
              <p class="text-sm text-gray-500">PNG, JPG up to 5MB</p>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/*"
                class="hidden"
              />
            </div>
            <div v-if="form.screenshot" class="mt-4 flex items-center">
              <div class="flex items-center bg-gray-100 rounded-lg p-3">
                <span class="text-gray-700 mr-3">📎</span>
                <span class="text-sm">{{ form.screenshot.name }}</span>
                <button
                  type="button"
                  @click="removeScreenshot"
                  class="ml-4 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            </div> -->
          <!-- </div> -->

          <!-- Contact Info -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Contact Information
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  v-model="form.email"
                  placeholder="you@example.com"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              <!-- <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  v-model="form.phone"
                  placeholder="+1 (555) 123-4567"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div> -->
            </div>
          </div>

          <!-- Urgency -->
          <!-- <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              How urgent is this issue?
            </label>
            <div class="space-y-3">
              <label
                v-for="level in urgencyLevels"
                :key="level.id"
                class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{
                  'border-blue-500 bg-blue-50': form.urgency === level.id,
                }"
              >
                <input
                  type="radio"
                  v-model="form.urgency"
                  :value="level.id"
                  class="h-4 w-4 text-blue-600 border-gray-300"
                />
                <div class="ml-3">
                  <div class="font-medium text-gray-900">{{ level.label }}</div>
                  <div class="text-sm text-gray-500">
                    {{ level.description }}
                  </div>
                </div>
              </label>
            </div>
          </div> -->

          <!-- Submit Button -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="cancel"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <span v-if="isSubmitting" class="animate-spin mr-2">⟳</span>
              {{ isSubmitting ? "Submitting..." : "Submit Issue" }}
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <div
        v-if="showSuccess"
        class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
      >
        <div class="text-green-600 mr-3">✅</div>
        <div>
          <p class="font-medium text-green-800">
            Issue submitted successfully!
          </p>
          <p class="text-green-700 text-sm">
            We'll get back to you within 24 hours at {{ form.email }}
          </p>
        </div>
        <button @click="showSuccess = false" class="ml-auto text-green-600">
          ×
        </button>
      </div>

      <!-- Help Links -->
      <!-- <div class="mt-8 text-center">
        <p class="text-gray-600 mb-4">Need immediate help?</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="#"
            class="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
          >
            📚 View Help Center
          </a>
          <a
            href="#"
            class="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
          >
            💬 Live Chat Support
          </a>
          <a
            href="#"
            class="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
          >
            📞 Call Support
          </a>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Form data
const form = ref({
  type: "",
  title: "",
  description: "",
  screenshot: null,
  email: "",
  phone: "",
  urgency: "medium",
});

// UI state
const isSubmitting = ref(false);
const showSuccess = ref(false);
const selectedType = ref("");
const fileInput = ref(null);

// Issue types
const issueTypes = ref([
  { id: "bug", label: "Bug Report", icon: "🐛" },
  { id: "feature", label: "Feature Request", icon: "✨" },
  { id: "ui", label: "UI Problem", icon: "🎨" },
  { id: "upload", label: "Upload Issue", icon: "📤" },
  { id: "account", label: "Account Issue", icon: "👤" },
  { id: "other", label: "Other", icon: "❓" },
]);

// Urgency levels
const urgencyLevels = ref([
  {
    id: "low",
    label: "Low Priority",
    description: "Minor issue, no rush",
  },
  {
    id: "medium",
    label: "Medium Priority",
    description: "Affecting normal use",
  },
  {
    id: "high",
    label: "High Priority",
    description: "Cannot use the app",
  },
  {
    id: "critical",
    label: "Critical",
    description: "Data loss or security issue",
  },
]);

// Methods
const selectIssueType = (type) => {
  selectedType.value = type;
  form.value.type = type;
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.size <= 5 * 1024 * 1024) {
    // 5MB limit
    form.value.screenshot = file;
  } else {
    alert("File must be less than 5MB");
  }
};

const removeScreenshot = () => {
  form.value.screenshot = null;
  fileInput.value.value = "";
};

const cancel = () => {
  if (confirm("Are you sure? Your changes will be lost.")) {
    resetForm();
    // Navigate back or to dashboard
  }
};

const resetForm = () => {
  form.value = {
    type: "",
    title: "",
    description: "",
    screenshot: null,
    email: "",
    phone: "",
    urgency: "medium",
  };
  selectedType.value = "";
  showSuccess.value = false;
};

const submitIssue = async () => {
  isSubmitting.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In real app: Send to backend
    // const response = await fetch('/api/issues', {
    //   method: 'POST',
    //   body: JSON.stringify(form.value)
    // })

    console.log("Issue submitted:", form.value);
    showSuccess.value = true;
    resetForm();

    // Auto-hide success message
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);
  } catch (error) {
    alert("Failed to submit issue. Please try again.");
    console.error("Submission error:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Custom radio button styling */
input[type="radio"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Smooth transitions */
button,
input,
textarea,
label {
  transition: all 0.2s ease;
}
</style>
