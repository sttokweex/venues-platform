export interface Venue {
    id: string;
    owner_user_id: string;
    name: string;
    address: string;
    capacity: number;
    phone: string | null;
    created_at: string;
    image_url: string | null;
    event_date: string | null;
}

export interface Profile {
    id: string;
    role: "user" | "admin";
    created_at: string;
}
