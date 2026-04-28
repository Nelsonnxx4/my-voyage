import { supabase } from "@/config/supabase";
import { supabaseApi } from "@/config/axios";
import { type FormDataType } from "@/types/formData";
// import type { VoyageTypeInfo, Rating } from "@/types/voyage";

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface VoyageTypeInfo {
  id: string;
  image_urls: string[];
  title: string;
  notes: string;
  user_id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date: string;
  rating: Rating;
  pins?: { display_name: string; lat: number; lon: number }[];
  comment?: string;
  created_at: string;
  updated_at?: string;
  isFavourite?: boolean;
}

export const fetchVoyages = async (): Promise<VoyageTypeInfo[]> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("Authentication error" + sessionError.message);
  }

  if (!session) {
    throw new Error("User must be authenticated to fetch voyages");
  }

  try {
    const response = await supabaseApi.get("/voyages", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      params: {
        select: "*",
        order: "created_at.desc",
      },
    });

    return response.data || [];
  } catch (error: any) {
    console.error("Error fetching voyages:", error);
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch voyages"
    );
  }
};

export const fetchVoyageById = async (
  id: string
): Promise<VoyageTypeInfo | null> => {
  if (!id) return null;

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error("Authentication error" + sessionError.message);
    }

    if (!session) {
      throw new Error("User must be authenticated to fetch voyages");
    }

    const response = await supabaseApi.get(`/voyages`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apiKey: import.meta.env.VITE_SUPABASE_KEY,
        "Content-Type": "application/json",
      },
      params: {
        id: `eq.${id}`,
        user_id: `eq.${session.user.id}`,
        select: "*",
      },
    });

    return response.data?.[0];
  } catch (error: any) {
    console.error("❌ Error fetching voyage:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch voyage"
    );
  }
};

export const createVoyage = async (
  voyage: FormDataType
): Promise<VoyageTypeInfo | null> => {
  if (!voyage) return null;

  try {
    console.log("Starting voyage creation with data:", voyage);

    const requiredFields = [
      "title",
      "location",
      "start_date",
      "end_date",
      "notes",
    ];

    for (const field of requiredFields) {
      if (!voyage[field as keyof FormDataType]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Authentication failed: " + sessionError.message);
    }

    if (!session) {
      throw new Error("User must be authenticated to create a voyage");
    }

    const formatDateForPostgres = (dateString: string) => {
      return new Date(dateString).toISOString().split("T")[0];
    };

    const voyageData = {
      title: voyage.title,
      image_urls: voyage.image_urls || [],
      notes: voyage.notes || "",
      location: voyage.location,
      start_date: formatDateForPostgres(voyage.start_date),
      end_date: formatDateForPostgres(voyage.end_date),
      rating: voyage.rating || 0,
      latitude: voyage.latitude,
      longitude: voyage.longitude,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
    };

    const response = await supabaseApi.post("/voyages", voyageData, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      params: {
        select: "*",
      },
    });
    console.log("Supabase API response:", response);

    if (response.status >= 400) {
      console.error("API Error Response:", response.data);
      throw new Error(
        `API Error: ${response.status} - ${JSON.stringify(response.data)}`
      );
    }

    return response.data?.[0] || null;
  } catch (error: any) {
    console.error("Error creating voyage:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
      stack: error.stack,
    });

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create voyage"
    );
  }
};

export const updateVoyage = async (
  id: string,
  data: FormDataType
): Promise<VoyageTypeInfo> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error("Authentication error: " + sessionError.message);
    }

    if (!session) {
      throw new Error("User must be authenticated to update a voyage");
    }

    const formatDate = (d: string) =>
      d ? new Date(d).toISOString().split("T")[0] : d;

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.start_date !== undefined)
      updateData.start_date = formatDate(data.start_date);
    if (data.end_date !== undefined)
      updateData.end_date = formatDate(data.end_date);
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.image_urls !== undefined) updateData.image_urls = data.image_urls;

    const response = await supabaseApi.patch(`/voyages`, updateData, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      params: {
        id: `eq.${id}`,
        select: "*",
      },
    });

    if (!response.data?.[0]) {
      throw new Error("Voyage not found");
    }

    return response.data[0];
  } catch (error: any) {
    console.error("Error updating voyage:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update voyage"
    );
  }
};

export const deleteVoyage = async (id: string): Promise<void> => {
  if (!id) return;

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error("Authentication error: " + sessionError.message);
    }

    if (!session) {
      throw new Error("User must be authenticated to delete a voyage");
    }

    await supabaseApi.delete(`/voyages`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_KEY,
        "Content-Type": "application/json",
      },
      params: {
        id: `eq.${id}`,
        user_id: `eq.${session.user.id}`,
      },
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete voyage"
    );
  }
};

export const searchVoyages = async (
  userId: string,
  query: string
): Promise<VoyageTypeInfo[]> => {
  try {
    const response = await supabaseApi.get("/voyages", {
      params: {
        user_id: `eq.${userId}`,
        or: `(title.ilike.%${query}%,location.ilike.%${query}%)`,
        order: "created_at.desc",
      },
    });
    return response.data || [];
  } catch (error: any) {
    console.error("Error searching voyages:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to search voyages"
    );
  }
};

export const filterByRating = async (
  userId: string,
  rating: Rating
): Promise<VoyageTypeInfo[]> => {
  try {
    const response = await supabaseApi.get("/voyages", {
      params: {
        user_id: `eq.${userId}`,
        rating: `eq.${rating}`,
        order: "created_at.desc",
      },
    });

    return response.data || [];
  } catch (error: any) {
    console.error("Error filtering voyages:", error);
    throw new Error(
      error.response?.data?.mesage ||
        error.message ||
        "Failed to filter voyages"
    );
  }
};
