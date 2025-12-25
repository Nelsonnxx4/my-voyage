import { supabase } from "@/config/supabase";
import type { AuthUser } from "@/types/user";

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: AuthUser | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) return { user: null, error };

    return {
      user: data.user,
      error,
    };
  } catch (err) {
    console.log("sign up error", err);
    throw err;
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: AuthUser; error: Error | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user as AuthUser,
    error,
  };
};

export const signInWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const deleteUserAccount = async (
  userId: string | undefined
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!userId) {
      throw new Error("User ID is undefined.");
    }

    const { error: dataError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (dataError) {
      throw new Error(`Failed to delete user data: ${dataError.message}`);
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }
    signOut();

    return { success: true };
  } catch (error) {
    console.error("Account deletion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const handleAuthCallback = async (): // email: string | undefined
Promise<AuthUser> => {
  const {
    data: { user },
    // error,
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | null;

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    name: user?.user_metadata?.full_name || user?.email || "guest",
    profileImage: avatarUrl,
    is_premium: false,
    created_at: new Date(),
    subscription_end: Date() || null,
  });

  return user;
};
