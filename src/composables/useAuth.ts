import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
} from "@/services/supabase/auth";
import { getCurrentUser, getUserProfile } from "@/services/supabase/profile";
import type { UserProfile } from "@/types/user";

const user = ref<UserProfile | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

export const useAuth = () => {
  const router = useRouter();
  const name = ref<string>("");
  const email = ref<string>("");
  const password = ref<string>("");

  const checkAuth = async () => {
    loading.value = true;
    error.value = null;
    try {
      const authUser = await getCurrentUser();
      if (authUser) {
        const profile = await getUserProfile(authUser.id);
        user.value = profile;
        return true;
      }
      return false;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Authentication failed";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const redirectBasedOnAuth = async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      router.push("/voyages");
    } else {
      router.push("/login");
    }
  };

  // signUp
  const handleSignup = async () => {
    try {
      loading.value = true;
      error.value = null;

      const { user: authUser, error: authError } = await signUpWithEmail(
        email.value,
        password.value,
        name.value
      );

      if (authError) throw authError;
      if (authUser?.identities?.length === 0) {
        throw new Error("Email already registered");
      }

      router.push({
        path: "/auth/confirm",
        query: {
          email: email.value,
        },
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Signup failed";
    } finally {
      loading.value = false;
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      loading.value = true;
      error.value = null;

      const { user: authUser, error: authError } = await signInWithEmail(
        email.value,
        password.value
      );

      if (authError) throw authError;
      if (authUser) {
        const profile = await getUserProfile(authUser.id);
        user.value = profile;
        await redirectBasedOnAuth();
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Login failed";
    } finally {
      loading.value = false;
    }
  };

  // login with google
  const loginWithGoogle = async () => {
    try {
      loading.value = true;
      await signInWithGoogle();
      loading.value = false;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Signing in with Google failed";
      throw err;
    }
  };

  //logout
  const handleLogout = async () => {
    try {
      loading.value = true;
      await signOut();

      user.value = null;
      await router.push("/login");
      loading.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Logout failed";
      throw err;
    }
  };

  return {
    user,
    loading,
    name,
    email,
    password,
    checkAuth,
    handleSignup,
    handleLogin,
    loginWithGoogle,
    handleLogout,
    redirectBasedOnAuth,
  };
};
