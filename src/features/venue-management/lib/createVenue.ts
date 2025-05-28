import { supabase } from "@shared/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { VenueFormValues } from "../model/types";
import { sendAdminEntityCreationEmail } from "@shared/lib/mailgun";

export const createVenue = async (values: VenueFormValues, userId: string) => {
    let image_url = null;
    if (values.image) {
        const extension = values.image.type === "image/png" ? ".png" : ".jpg";
        const fileName = `${uuidv4()}${extension}`;

        const { error: uploadError } = await supabase.storage.from("venue-images").upload(fileName, values.image);
        if (uploadError) {
            throw new Error(`Error uploading image: ${uploadError.message}`);
        }
        const { data: publicUrlData } = supabase.storage.from("venue-images").getPublicUrl(fileName);
        image_url = publicUrlData.publicUrl;
    }
    const user = await supabase.auth.getUser();

    const { error } = await supabase.from("venues").insert([
        {
            name: values.name,
            address: values.address,
            capacity: parseInt(values.capacity),
            phone: values.phone,
            owner_user_id: userId,
            image_url,
            event_date: values.event_date || null,
        },
    ]);
    await sendAdminEntityCreationEmail(user.data.user.email!, "venue", {
        name: values.name,
        address: values.address,
        capacity: values.capacity,
        phone: values.phone,
        image_url: values.image ? values.image.name : null,
        event_date: values.event_date,
    });

    if (error) {
        throw new Error(`Error: ${error.message}`);
    }

    return `Venue created: ${values.name}`;
};
