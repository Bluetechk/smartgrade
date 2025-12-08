// Utility function to get Supabase storage photo URL
// Add this to src/lib/utils.ts or create src/lib/photoUtils.ts

import { supabase } from "@/integrations/supabase/client";

export const getPhotoPublicUrl = (filePath: string): string => {
  // Method 1: Use getPublicUrl() (recommended)
  const { data } = supabase.storage
    .from("student-photos")
    .getPublicUrl(filePath);
  
  if (data?.publicUrl) {
    return data.publicUrl;
  }
  
  // Method 2: Fallback - construct URL manually
  // This ensures the URL is valid even if getPublicUrl() has issues
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://buqwtrshkmjpueofcfac.supabase.co";
  const fallbackUrl = `${supabaseUrl}/storage/v1/object/public/student-photos/${filePath.replace("student-photos/", "")}`;
  
  console.warn("Using fallback photo URL construction:", fallbackUrl);
  return fallbackUrl;
};

// Usage example:
// const photoUrl = getPhotoPublicUrl("student-photos/student-100-1733356892391");
