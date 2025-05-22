"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { User } from "@supabase/supabase-js";
import { Venue, Profile } from "@/shared/types";
import { generatePDF } from "@/shared/helpers/generatePdf";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Home() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const { data, error } = await supabase
                .from("profiles")
                .select("role, created_at")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                router.push("/login");
            } else {
                setProfile(data as Profile);
            }

            const { data: venuesData } = await supabase.from("venues").select("*");
            setVenues((venuesData as Venue[]) || []);
            setLoading(false);
        };

        fetchUserAndProfile();
    }, [router]);

    if (loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (!user || !profile) {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Venue Booking Platform</h1>
            {profile.role === "admin" && (
                <Link href="/admin" className="text-blue-500 mb-4 inline-block">
                    Go to Admin Dashboard
                </Link>
            )}
            <h2 className="text-xl mt-4">All Venues</h2>
            <div className="grid grid-cols-1 gap-4">
                {venues.map((venue) => (
                    <div key={venue.id} className="border p-4 rounded">
                        <h3 className="text-lg font-semibold">
                            <Link href={`/venues/${venue.id}`} className="text-blue-500">
                                {venue.name}
                            </Link>
                        </h3>
                        {venue.image_url && (
                            <img src={venue.image_url} alt={venue.name} className="w-full h-48 object-cover mb-2" />
                        )}
                        <p>Address: ${venue.address}</p>
                        <p>Capacity: ${venue.capacity}</p>
                        <p>Phone: ${venue.phone || "N/A"}</p>
                        <p>Event Date: ${venue.event_date ? new Date(venue.event_date).toLocaleString() : "N/A"}</p>
                        <button
                            onClick={() => generatePDF(venue)}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Download PDF
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
