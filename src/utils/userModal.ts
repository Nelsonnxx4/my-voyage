import { ref, watch } from "vue";
import { useUserProfile } from "@/composables/useUserProfile";
import { useTheme } from "@/composables/useTheme";
import { deleteUserAccount } from "@/services/supabase/auth";

export const useUserModal = () => {
  const {
    userData,
    handleUpdateUserProfile,
    handleUpdateUserEmail,
    handleUploadUserProfileImage,
    handleDeleteUserProfileImage,
    resendUserEmailConfirmation,
  } = useUserProfile();

  // Theme management
  const { theme, setTheme, availableThemes } = useTheme();

  const activeTab = ref("profile");
  const showLogoutModal = ref<boolean>(false);
  const showDeleteAccountModal = ref<boolean>(false);

  const openLogoutModal = () => (showLogoutModal.value = true);

  const closeLogoutModal = () => (showLogoutModal.value = false);

  const openDeleteAccountModal = () => (showDeleteAccountModal.value = true);

  const closeDeleteAccountModal = () => (showDeleteAccountModal.value = false);

  const isEditingProfile = ref(false);
  const successMessage = ref("");

  const dragOver = ref<boolean>(false);
  const fileInput = ref<HTMLInputElement | null>(null);
  const isImgLoading = ref<boolean>(false);

  const editForm = ref({
    name: "",
    email: "",
  });

  const editFormErrors = ref({
    name: "",
    email: "",
  });

  const initializeEditForm = () => {
    if (userData.value) {
      editForm.value = {
        name: userData.value.name || "",
        email: userData.value.email || "",
      };
    }
  };

  // Watch for userData changes to update edit form
  watch(
    userData,
    () => {
      if (userData.value) {
        initializeEditForm();
      }
    },
    { immediate: true }
  );

  // Form validation
  const validateForm = () => {
    const errors = { name: "", email: "" };
    let isValid = true;

    if (!editForm.value.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!editForm.value.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.value.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    editFormErrors.value = errors;
    return isValid;
  };

  // Start editing profile
  const startEditingProfile = () => {
    isEditingProfile.value = true;
    initializeEditForm();
    editFormErrors.value = { name: "", email: "" };
  };

  // Cancel editing profile
  const cancelEditingProfile = () => {
    isEditingProfile.value = false;
    initializeEditForm();
    editFormErrors.value = { name: "", email: "" };
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    if (!validateForm()) return;

    try {
      const updates: { name?: string } = {};
      let emailUpdateNeeded = false;

      // Check if name changed
      if (editForm.value.name !== userData.value?.name) {
        updates.name = editForm.value.name;
      }

      // Check if email changed
      if (editForm.value.email !== userData.value?.email) {
        emailUpdateNeeded = true;
      }

      // Update profile data (name and image)
      if (Object.keys(updates).length > 0) {
        const result = await handleUpdateUserProfile(updates);
        if (!result.success) {
          return;
        }
      }

      // Update email if changed
      if (emailUpdateNeeded) {
        const password = prompt(
          "Please enter your current password to update email:"
        );
        if (!password) {
          editFormErrors.value.email = "Password required to update email";
          return;
        }

        const emailResult = await handleUpdateUserEmail({
          newEmail: editForm.value.email,
          currentPassword: password,
        });

        if (!emailResult.success) {
          editFormErrors.value.email =
            emailResult.error || "Failed to update email";
          return;
        }
      }

      isEditingProfile.value = false;
      successMessage.value = "Profile updated successfully!";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // Profile image handling functions
  const openFileInput = () => {
    if (!isImgLoading.value) {
      fileInput.value?.click();
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!isImgLoading.value) {
      dragOver.value = true;
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragOver.value = false;
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      console.error("Selected file is not an image");
      return;
    }

    isImgLoading.value = true;

    try {
      const result = await handleUploadUserProfileImage(file);
      if (result.success) {
        successMessage.value = "Profile image updated successfully!";
        setTimeout(() => {
          successMessage.value = "";
        }, 3000);
      } else {
        console.error("Failed to upload image:", result.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      isImgLoading.value = false;
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragOver.value = false;

    if (isImgLoading.value) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith("image/")) {
      processImageFile(files[0]);
    }
  };

  // Handle image upload from file input
  const handleImageUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file && !isImgLoading.value) {
      await processImageFile(file);
      // Clear the input value so the same file can be selected again
      target.value = "";
    }
  };

  // Handle image deletion
  const handleDeleteImage = async () => {
    if (confirm("Are you sure you want to delete your profile image?")) {
      const result = await handleDeleteUserProfileImage();
      if (result.success) {
        successMessage.value = "Profile image deleted successfully!";
        setTimeout(() => {
          successMessage.value = "";
        }, 3000);
      }
    }
  };

  // Resend email confirmation
  const resendEmailConfirmation = async () => {
    const result = await resendUserEmailConfirmation();
    if (result.success) {
      successMessage.value = "Verification email sent!";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  };

  const confirmDeleteAccount = (userId: string | undefined) => {
    deleteUserAccount(userId);
  };

  return {
    activeTab,
    showLogoutModal,
    showDeleteAccountModal,
    openLogoutModal,
    closeLogoutModal,
    openDeleteAccountModal,
    closeDeleteAccountModal,
    confirmDeleteAccount,
    isEditingProfile,
    editForm,
    editFormErrors,
    startEditingProfile,
    cancelEditingProfile,
    saveProfileChanges,
    successMessage,
    // Profile image handling
    dragOver,
    fileInput,
    isImgLoading,
    openFileInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleImageUpload,
    handleDeleteImage,
    resendEmailConfirmation,
    // Theme handling
    theme,
    setTheme,
    availableThemes,
    // User data
    userData,
  };
};
