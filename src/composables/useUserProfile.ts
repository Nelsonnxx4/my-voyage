import { ref, computed, watchEffect } from "vue";
import { supabase } from "@/config/supabase";
import type { UserProfile } from "@/types/user";
import { useAuth } from "./useAuth";
import { useRouter } from "vue-router";
import {
  getUserProfile,
  updateProfile,
  updateEmail,
  uploadProfileImage,
  deleteProfileImage,
  resendEmailConfirmation,
  checkEmailConfirmation,
  type UpdateProfileData,
  type EmailUpdateData,
} from "@/services/supabase/profile";

export const useUserProfile = () => {
  const userData = ref<UserProfile | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const isEmailConfirmed = ref<boolean>(false);
  const isUpdating = ref<boolean>(false);

  const router = useRouter();
  const { user: authUser } = useAuth();

  const maskedEmail = computed(() => {
    if (!userData.value?.email) return "";
    const [username, domain] = userData.value.email.split("@");
    return `${username?.substring(0, 2)}****${username?.slice(-1)}@${domain}`;
  });

  // Fetch user profile
  const handleFetchUserProfile = async (userId: string) => {
    try {
      loading.value = true;
      error.value = null;

      const profileData = await getUserProfile(userId);

      if (!profileData) {
        // Create profile if it doesn't exist
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error: createError } = await supabase.from("profiles").upsert({
          id: userId,
          email: user.email,
          created_at: new Date().toISOString(),
          name: user.email ? user.email.split("@")[0] : "Guest",
        });

        if (createError) throw createError;

        const newProfile = await getUserProfile(userId);
        if (!newProfile) throw new Error("Profile creation failed");

        userData.value = {
          id: newProfile.id,
          name:
            newProfile.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Guest",
          email: newProfile.email || "",
          profile_image: newProfile.profile_image || "",
          is_premium: newProfile.is_premium || false,
          created_at: newProfile.created_at
            ? new Date(newProfile.created_at).toISOString()
            : new Date().toISOString(),
          updated_at: newProfile.updated_at
            ? new Date(newProfile.updated_at).toISOString()
            : new Date().toISOString(),
        };

        return;
      }

      userData.value = {
        id: profileData.id,
        name: profileData.name || authUser.value?.name || "Guest",
        email: profileData.email || authUser.value?.email || "",
        profile_image:
          profileData.profile_image || authUser.value?.profile_image,
        is_premium: profileData.is_premium || false,
        created_at: profileData.created_at
          ? new Date(profileData.created_at).toISOString()
          : new Date().toISOString(),
        updated_at: profileData.updated_at
          ? new Date(profileData.updated_at).toISOString()
          : new Date().toISOString(),
      };

      // Check email confirmation status
      isEmailConfirmed.value = await checkEmailConfirmation();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to Load Profile";
      console.error("profile fetch error", err);
    } finally {
      loading.value = false;
    }
  };

  // Update profile (name and profile image)
  const handleUpdateUserProfile = async (
    updateData: Omit<UpdateProfileData, "email">
  ) => {
    if (!userData.value?.id) {
      error.value = "No user profile found";
      return { success: false, error: "No user profile found" };
    }

    try {
      isUpdating.value = true;
      error.value = null;

      const result = await updateProfile(userData.value.id, updateData);

      if (result.success && result.data) {
        userData.value = result.data;
        return { success: true };
      } else {
        error.value = result.error || "Failed to update profile";
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isUpdating.value = false;
    }
  };

  // Update email with password confirmation
  const handleUpdateUserEmail = async (emailData: EmailUpdateData) => {
    if (!userData.value?.id) {
      error.value = "No user profile found";
      return { success: false, error: "No user profile found" };
    }

    try {
      isUpdating.value = true;
      error.value = null;

      const result = await updateEmail(emailData);

      if (result.success) {
        // Refresh user data to get updated email
        await handleFetchUserProfile(userData.value.id);
        return { success: true };
      } else {
        error.value = result.error || "Failed to update email";
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update email";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isUpdating.value = false;
    }
  };

  // Upload profile image
  const handleUploadUserProfileImage = async (file: File) => {
    if (!userData.value?.id) {
      error.value = "No user profile found";
      return { success: false, error: "No user profile found" };
    }

    try {
      isUpdating.value = true;
      error.value = null;

      const result = await uploadProfileImage(userData.value.id, file);

      if (result.success && result.url) {
        // Update profile with new image URL
        const updateResult = await handleUpdateUserProfile({
          profile_image: result.url,
        });
        return updateResult;
      } else {
        error.value = result.error || "Failed to upload image";
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isUpdating.value = false;
    }
  };

  // Delete profile image
  const handleDeleteUserProfileImage = async () => {
    if (!userData.value?.id || !userData.value?.profile_image) {
      error.value = "No profile image to delete";
      return { success: false, error: "No profile image to delete" };
    }

    try {
      isUpdating.value = true;
      error.value = null;

      const result = await deleteProfileImage(
        userData.value.id,
        userData.value.profile_image
      );

      if (result.success) {
        // Update local user data
        userData.value.profile_image = "";
        return { success: true };
      } else {
        error.value = result.error || "Failed to delete image";
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete image";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isUpdating.value = false;
    }
  };

  // Resend email confirmation
  const resendUserEmailConfirmation = async () => {
    if (!userData.value?.email) {
      error.value = "No email address found";
      return { success: false, error: "No email address found" };
    }

    try {
      isUpdating.value = true;
      error.value = null;

      const result = await resendEmailConfirmation(userData.value.email);

      if (result.success) {
        return { success: true };
      } else {
        error.value = result.error || "Failed to resend confirmation";
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resend confirmation";
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isUpdating.value = false;
    }
  };

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  // Auth state change listener
  supabase.auth.onAuthStateChange((_, session) => {
    if (session?.user) {
      authUser.value = {
        id: session.user.id,
        name:
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "Guest",
        email: session.user.email || "",
        profile_image: session.user.user_metadata?.avatar_url || "",
        is_premium: false,
        created_at: session.user.created_at
          ? new Date(session.user.created_at).toISOString()
          : new Date().toISOString(),
        updated_at: session.user.updated_at
          ? new Date(session.user.updated_at).toISOString()
          : new Date().toISOString(),
      };
    } else {
      authUser.value = null;
    }
  });

  // Watch for auth changes
  watchEffect(async () => {
    try {
      if (authUser.value && authUser.value.id) {
        await handleFetchUserProfile(authUser.value.id);
      } else {
        userData.value = null;
        if (router?.currentRoute?.value?.path !== "/login") {
          router?.push("/login");
        }
      }
    } catch (err) {
      console.error("Auth watch error:", err);
    }
  });

  return {
    // State
    userData,
    error,
    loading,
    isUpdating,
    isEmailConfirmed,
    maskedEmail,

    // Actions
    handleFetchUserProfile,
    handleUpdateUserProfile,
    handleUpdateUserEmail,
    handleUploadUserProfileImage,
    handleDeleteUserProfileImage,
    resendUserEmailConfirmation,
    clearError,
  };
};
