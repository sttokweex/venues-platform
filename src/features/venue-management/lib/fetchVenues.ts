import { supabase } from "@shared/lib/supabase";
import { Venue } from "@entities/venue/model/types";

export const fetchVenues = async (ownerUserId?: string): Promise<Venue[]> => {
    console.log("Fetching venues from Supabase...", { ownerUserId });
    let query = supabase.from("venues").select("*").order("created_at", { ascending: false });

    if (ownerUserId) {
        query = query.eq("owner_user_id", ownerUserId);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Fetch venues error:", error.message, error.details);
    }
    console.log("Venues fetched:", data);
    return (data as Venue[]) || [];
};
