import { supabase } from "@/config/supabase";

export const setupStorageBucket = async (): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log("Error checking buckets:", error);
      return false;
    }

    const voyageBucket = buckets?.find(
      (bucket) => bucket.name === "voyage-images" || "voyages"
    );

    if (!voyageBucket) {
      return false;
    }

    return true;
  } catch (error) {
    console.log("Storage setup error:", error);
    return false;
  }
};
