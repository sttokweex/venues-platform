import { supabase } from "@shared/lib/supabase";
import { Venue } from "@entities/venue/model/types";

export const deleteVenue = async (venue: Venue) => {
    const { error } = await supabase.from("venues").delete().eq("id", venue.id);

    if (error) {
        throw new Error(`Error: ${error.message}`);
    }

    return `Venue deleted: ${venue.name}`;
};
