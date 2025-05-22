import { supabase } from "@shared/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { VenueFormValues } from "../model/types";
import { Venue } from "@entities/venue/model/types";

export const updateVenue = async (values: VenueFormValues, venue: Venue) => {
    let image_url = venue.image_url;
    if (values.image) {
        const extension = values.image.type === "image/png" ? ".png" : ".jpg";
        const fileName = `${uuidv4()}${extension}`;

        const { error: uploadError } = await supabase.storage
            .from("venue-images")
            .upload(fileName, values.image, { upsert: true });
        if (uploadError) {
            throw new Error(`Error uploading image: ${uploadError.message}`);
        }
        const { data: publicUrlData } = supabase.storage.from("venue-images").getPublicUrl(fileName);
        image_url = publicUrlData.publicUrl;
    }

    const { error } = await supabase
        .from("venues")
        .update({
            name: values.name,
            address: values.address,
            capacity: parseInt(values.capacity),
            phone: values.phone,
            image_url,
            event_date: values.event_date || null,
        })
        .eq("id", venue.id);

    if (error) {
        throw new Error(`Error: ${error.message}`);
    }

    return `Venue updated: ${values.name}`;
};
