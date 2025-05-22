"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkAuth } from "@features/auth/lib/checkAuth";
import { logout } from "@features/auth/lib/logout";
import { fetchVenues } from "@features/venue-management/lib/fetchVenues";
import { generatePDF } from "@features/pdf-generation/lib/generatePdf";
import { Profile } from "@entities/profile/model/types";
import { Venue } from "@entities/venue/model/types";
import { Card } from "@shared/ui/Card";
import { Button } from "@shared/ui/Button";
import { Spinner } from "@shared/ui/Spinner";

export default function Home() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        const fetchData = async () => {
            try {
                console.log("Fetching user data...");
                await checkAuth(router, setProfile, setLoading);
            } catch (err: unknown) {
                console.error("Error fetching data:", err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [router]);

    useEffect(() => {
        if (!profile || loading) return;

        const fetchVenuesData = async () => {
            try {
                console.log("Fetching all venues for user:", profile.role);
                const data = await fetchVenues(); // Без ownerUserId для всех площадок
                console.log("Venues fetched:", data);
                setVenues(data);
            } catch (err: unknown) {
                console.error("Error fetching venues:", err instanceof Error ? err.message : "Unknown error");
            }
        };
        fetchVenuesData();
    }, [profile, loading]);

    const handleLogout = async () => {
        try {
            console.log("Logging out...");
            await logout();
            router.push("/auth");
        } catch (err: unknown) {
            console.error("Logout error:", err instanceof Error ? err.message : "Unknown error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto p-6">
                <Card className="mb-6">
                    <h1 className="text-3xl font-bold mb-4">Venue Booking Platform</h1>
                    <p className="text-gray-600">Please log in to continue.</p>
                    <Link href="/auth" className="text-blue-600 hover:underline">
                        Go to Login
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <Card className="mb-6">
                <h1 className="text-3xl font-bold mb-4">Venue Booking Platform</h1>
                <div className="flex flex-col space-y-2">
                    {profile.role === "admin" && (
                        <Link href="/admin" className="text-blue-600 hover:underline">
                            Go to Admin Dashboard
                        </Link>
                    )}
                    <Button variant="secondary" size="sm" onClick={handleLogout} className="w-fit">
                        Logout
                    </Button>
                </div>
            </Card>
            <h2 className="text-2xl font-semibold mb-4">All Venues</h2>
            {venues.length === 0 ? (
                <p className="text-gray-600">
                    No venues available.{" "}
                    {profile.role === "admin" ? "Create one in the Admin Dashboard." : "Check back later!"}
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                        <Card key={venue.id}>
                            <h3 className="text-lg font-semibold">
                                <Link href={`/venues/${venue.id}`} className="text-blue-600 hover:underline">
                                    {venue.name}
                                </Link>
                            </h3>
                            {venue.image_url && (
                                <img
                                    src={venue.image_url}
                                    alt={venue.name}
                                    className="w-full h-48 object-cover rounded-lg mt-2"
                                />
                            )}
                            <p className="text-gray-600 mt-2">Address: {venue.address}</p>
                            <p className="text-gray-600">Capacity: {venue.capacity}</p>
                            <p className="text-gray-600">Phone: {venue.phone || "N/A"}</p>
                            <p className="text-gray-600">
                                Event Date: {venue.event_date ? new Date(venue.event_date).toLocaleString() : "N/A"}
                            </p>
                            <Button variant="primary" size="sm" className="mt-4" onClick={() => generatePDF(venue)}>
                                Download PDF
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
