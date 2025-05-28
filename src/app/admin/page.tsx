"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkAuth } from "@features/auth/lib/checkAuth";
import { fetchVenues } from "@features/venue-management/lib/fetchVenues";
import { createVenue } from "@features/venue-management/lib/createVenue";
import { updateVenue } from "@features/venue-management/lib/updateVenue";
import { deleteVenue } from "@features/venue-management/lib/deleteVenue";
import { VenueForm } from "@features/venue-management/ui/VenueForm";
import { VenueList } from "@features/venue-management/ui/VenueList";
import { EditVenueModal } from "@features/venue-management/ui/EditVenueModal";
import { DeleteVenueModal } from "@features/venue-management/ui/DeleteVenueModal";
import { Profile } from "@entities/profile/model/types";
import { VenueFormValues } from "@features/venue-management/model/types";
import { Spinner } from "@shared/ui/Spinner";
import { Card } from "@shared/ui/Card";
import { supabase } from "@shared/lib/supabase";
import { Venue } from "@entities/venue/model/types";
import { sendAdminEntityCreationEmail } from "@shared/lib/mailgun";

export default function AdminDashboard() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
    const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);
    const router = useRouter();

    const fetchVenuesData = useCallback(async (userId: string) => {
        try {
            const data = await fetchVenues(userId);

            setVenues(data);
        } catch (err: unknown) {
            setNotification(err instanceof Error ? err.message : "Unknown error");
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            try {
                const isAdmin = await checkAuth(router, setProfile, setLoading);
                if (isAdmin) {
                    const {
                        data: { user },
                    } = await supabase.auth.getUser();
                    if (user) {
                        await fetchVenuesData(user.id);
                    }
                }
            } catch (err: unknown) {
                setNotification(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        initialize();
    }, [router, fetchVenuesData]);

    const handleCreate = async (values: VenueFormValues, { resetForm }: { resetForm: () => void }) => {
        try {
            const user = await supabase.auth.getUser();
            if (!user.data.user) {
                setNotification("Error: User not authenticated");
                router.push("/auth");
                return;
            }
            const message = await createVenue(values, user.data.user.id);
            setNotification(message);
            resetForm();
            await fetchVenuesData(user.data.user.id);
        } catch (err: any) {
            setNotification(err.message);
        }
    };

    const handleUpdate = async (values: VenueFormValues) => {
        if (!editingVenue) return;
        try {
            const user = await supabase.auth.getUser();
            if (!user.data.user) {
                setNotification("Error: User not authenticated");
                router.push("/auth");
                return;
            }
            const message = await updateVenue(values, editingVenue);
            setNotification(message);
            setEditingVenue(null);
            await fetchVenuesData(user.data.user.id);
        } catch (err: any) {
            setNotification(err.message);
        }
    };

    const handleDelete = async () => {
        if (!deletingVenue) return;
        try {
            const user = await supabase.auth.getUser();
            if (!user.data.user) {
                setNotification("Error: User not authenticated");
                router.push("/auth");
                return;
            }
            const message = await deleteVenue(deletingVenue);
            setNotification(message);
            setDeletingVenue(null);
            await fetchVenuesData(user.data.user.id);
        } catch (err: any) {
            setNotification(err.message);
        }
    };

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <Card className="mb-6">
                <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
                <Link href="/" className="text-blue-600 hover:underline">
                    Back to Home
                </Link>
            </Card>
            {notification && (
                <div
                    className={`p-4 mb-6 rounded-lg ${
                        notification.startsWith("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                >
                    {notification}
                </div>
            )}
            <Card className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Create Venue</h2>
                <VenueForm
                    initialValues={{ name: "", address: "", capacity: "", phone: "", image: null, event_date: "" }}
                    onSubmit={handleCreate}
                />
            </Card>
            <h2 className="text-2xl font-semibold mb-4">Your Venues</h2>
            <VenueList venues={venues} onEdit={setEditingVenue} onDelete={setDeletingVenue} />
            <EditVenueModal
                isOpen={editingVenue !== null}
                onClose={() => setEditingVenue(null)}
                venue={editingVenue}
                onSubmit={handleUpdate}
            />
            <DeleteVenueModal
                isOpen={deletingVenue !== null}
                onClose={() => setDeletingVenue(null)}
                venue={deletingVenue!}
                onConfirm={handleDelete}
            />
        </div>
    );
}
