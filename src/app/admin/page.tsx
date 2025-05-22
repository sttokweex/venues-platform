"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { Venue, Profile } from "@/shared/types";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface VenueFormValues {
    name: string;
    address: string;
    capacity: string;
    phone: string;
    image: File | null;
    event_date: string;
}

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    address: Yup.string().required("Address is required"),
    capacity: Yup.number().required("Capacity is required").positive().integer(),
    phone: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
        .required("Phone number is required"),
    image: Yup.mixed()
        .nullable()
        .test("fileType", "Only PNG or JPEG images are allowed", (value) => {
            if (!value) return true;
            return ["image/png", "image/jpeg"].includes((value as File).type);
        }),
    event_date: Yup.date().nullable(),
});

export default function AdminDashboard() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
    const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);
    const router = useRouter();

    const checkUserAndProfile = useCallback(async () => {
        console.log("Checking user and profile...");
        try {
            setLoading(true);
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError || !user) {
                console.log("No user found, redirecting to /login");
                router.push("/login");
                return false;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("role, created_at")
                .eq("id", user.id)
                .single();

            if (error || !data) {
                console.error("Profile error:", error?.message || "No profile found");
                router.push("/");
                return false;
            }

            if (data.role !== "admin") {
                console.log("Not an admin, redirecting to /");
                router.push("/");
                return false;
            }

            console.log("User is admin, setting profile");
            setProfile(data as Profile);
            setLoading(false);
            return true;
        } catch (err) {
            console.error("Error in checkUserAndProfile:", err);
            router.push("/login");
            return false;
        }
    }, [router]);

    const fetchVenues = useCallback(async () => {
        console.log("Fetching venues...");
        try {
            const { data, error } = await supabase.from("venues").select("*");
            if (error) {
                console.error("Error fetching venues:", error);
                setNotification(`Error fetching venues: ${error.message}`);
            } else {
                setVenues((data as Venue[]) || []);
            }
        } catch (err) {
            console.error("Error in fetchVenues:", err);
            setNotification("Error fetching venues");
        }
    }, []);

    useEffect(() => {
        console.log("Running useEffect for checkUserAndProfile");
        checkUserAndProfile().then((isAdmin) => {
            if (isAdmin) {
                fetchVenues();
            }
        });
    }, [checkUserAndProfile, fetchVenues]);

    const handleSubmit = async (values: VenueFormValues, { resetForm }: { resetForm: () => void }) => {
        console.log("Submitting venue:", values);
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError || !user) {
                setNotification("Error: User not authenticated");
                router.push("/login");
                return;
            }

            let image_url = null;
            if (values.image) {
                const extension = values.image.type === "image/png" ? ".png" : ".jpg";
                const fileName = `${uuidv4()}${extension}`;
                const { error: uploadError } = await supabase.storage
                    .from("venue-images")
                    .upload(fileName, values.image);
                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    setNotification(`Error uploading image: ${uploadError.message}`);
                    return;
                }
                const { data: publicUrlData } = supabase.storage.from("venue-images").getPublicUrl(fileName);
                image_url = publicUrlData.publicUrl;
                console.log("Uploaded image URL:", image_url);
            }

            const { error } = await supabase.from("venues").insert([
                {
                    name: values.name,
                    address: values.address,
                    capacity: parseInt(values.capacity),
                    phone: values.phone,
                    owner_user_id: user.id,
                    image_url,
                    event_date: values.event_date || null,
                },
            ]);
            if (!error) {
                setNotification(`Venue created: ${values.name}`);
                resetForm();
                await fetchVenues();
            } else {
                console.error("Insert error:", error);
                setNotification(`Error: ${error.message}`);
            }
        } catch (err) {
            console.error("Error creating venue:", err);
            setNotification("Error creating venue");
        }
    };

    const handleUpdate = async (values: VenueFormValues) => {
        if (!editingVenue) return;
        console.log("Updating venue:", values);
        try {
            let image_url = editingVenue.image_url;
            if (values.image) {
                const extension = values.image.type === "image/png" ? ".png" : ".jpg";
                const fileName = `${uuidv4()}${extension}`;
                const { error: uploadError } = await supabase.storage
                    .from("venue-images")
                    .upload(fileName, values.image, { upsert: true });
                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    setNotification(`Error uploading image: ${uploadError.message}`);
                    return;
                }
                const { data: publicUrlData } = supabase.storage.from("venue-images").getPublicUrl(fileName);
                image_url = publicUrlData.publicUrl;
                console.log("Uploaded image URL:", image_url);
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
                .eq("id", editingVenue.id);
            if (!error) {
                setNotification(`Venue updated: ${values.name}`);
                setEditingVenue(null);
                await fetchVenues();
            } else {
                console.error("Update error:", error);
                setNotification(`Error: ${error.message}`);
            }
        } catch (err) {
            console.error("Error updating venue:", err);
            setNotification("Error updating venue");
        }
    };

    const handleDelete = async (venue: Venue) => {
        console.log("Deleting venue:", venue.id);
        try {
            const { error } = await supabase.from("venues").delete().eq("id", venue.id);
            if (!error) {
                setNotification(`Venue deleted: ${venue.name}`);
                setDeletingVenue(null);
                await fetchVenues();
            } else {
                console.error("Delete error:", error);
                setNotification(`Error: ${error.message}`);
            }
        } catch (err) {
            console.error("Error deleting venue:", err);
            setNotification("Error deleting venue");
        }
    };

    const openEditModal = (venue: Venue) => {
        setEditingVenue(venue);
    };

    const closeEditModal = () => {
        setEditingVenue(null);
    };

    const openDeleteModal = (venue: Venue) => {
        setDeletingVenue(venue);
    };

    const closeDeleteModal = () => {
        setDeletingVenue(null);
    };

    if (loading || !profile) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <Link href="/" className="text-blue-500 mb-4 inline-block">
                Back to Home
            </Link>
            {notification && (
                <div
                    className={`p-2 mb-4 rounded ${
                        notification.startsWith("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                >
                    {notification}
                </div>
            )}
            <Formik
                initialValues={{ name: "", address: "", capacity: "", phone: "", image: null, event_date: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form className="mb-8">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium">
                                Name
                            </label>
                            <Field name="name" type="text" className="mt-1 p-2 border rounded w-full" />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="address" className="block text-sm font-medium">
                                Address
                            </label>
                            <Field name="address" type="text" className="mt-1 p-2 border rounded w-full" />
                            <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="capacity" className="block text-sm font-medium">
                                Capacity
                            </label>
                            <Field name="capacity" type="number" className="mt-1 p-2 border rounded w-full" />
                            <ErrorMessage name="capacity" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-medium">
                                Phone
                            </label>
                            <Field name="phone" type="text" className="mt-1 p-2 border rounded w-full" />
                            <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="image" className="block text-sm font-medium">
                                Image
                            </label>
                            <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/png,image/jpeg"
                                className="mt-1 p-2 border rounded w-full"
                                onChange={(event) => {
                                    const file = event.currentTarget.files?.[0];
                                    setFieldValue("image", file || null);
                                }}
                            />
                            <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="event_date" className="block text-sm font-medium">
                                Event Date
                            </label>
                            <Field name="event_date" type="datetime-local" className="mt-1 p-2 border rounded w-full" />
                            <ErrorMessage name="event_date" component="div" className="text-red-500 text-sm" />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            Create Venue
                        </button>
                    </Form>
                )}
            </Formik>

            {/* Edit Modal */}
            {editingVenue && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">Edit Venue</h2>
                        <Formik
                            initialValues={{
                                name: editingVenue.name,
                                address: editingVenue.address,
                                capacity: editingVenue.capacity.toString(),
                                phone: editingVenue.phone || "",
                                image: null,
                                event_date: editingVenue.event_date
                                    ? new Date(editingVenue.event_date).toISOString().slice(0, 16)
                                    : "",
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleUpdate}
                        >
                            {({ isSubmitting, setFieldValue }) => (
                                <Form>
                                    <div className="mb-4">
                                        <label htmlFor="name" className="block text-sm font-medium">
                                            Name
                                        </label>
                                        <Field name="name" type="text" className="mt-1 p-2 border rounded w-full" />
                                        <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="address" className="block text-sm font-medium">
                                            Address
                                        </label>
                                        <Field name="address" type="text" className="mt-1 p-2 border rounded w-full" />
                                        <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="capacity" className="block text-sm font-medium">
                                            Capacity
                                        </label>
                                        <Field
                                            name="capacity"
                                            type="number"
                                            className="mt-1 p-2 border rounded w-full"
                                        />
                                        <ErrorMessage
                                            name="capacity"
                                            component="div"
                                            className="text-red-500 text-sm"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="phone" className="block text-sm font-medium">
                                            Phone
                                        </label>
                                        <Field name="phone" type="text" className="mt-1 p-2 border rounded w-full" />
                                        <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="image" className="block text-sm font-medium">
                                            Image
                                        </label>
                                        <input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept="image/png,image/jpeg"
                                            className="mt-1 p-2 border rounded w-full"
                                            onChange={(event) => {
                                                const file = event.currentTarget.files?.[0];
                                                setFieldValue("image", file || null);
                                            }}
                                        />
                                        {editingVenue.image_url && (
                                            <p className="text-sm text-gray-500">
                                                Current:{" "}
                                                <a
                                                    href={editingVenue.image_url}
                                                    target="_blank"
                                                    className="text-blue-500"
                                                >
                                                    View Image
                                                </a>
                                            </p>
                                        )}
                                        <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="event_date" className="block text-sm font-medium">
                                            Event Date
                                        </label>
                                        <Field
                                            name="event_date"
                                            type="datetime-local"
                                            className="mt-1 p-2 border rounded w-full"
                                        />
                                        <ErrorMessage
                                            name="event_date"
                                            component="div"
                                            className="text-red-500 text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={closeEditModal}
                                            className="bg-gray-300 text-black px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingVenue && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p className="mb-4">
                            Are you sure you want to delete <strong>{deletingVenue.name}</strong>?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeDeleteModal} className="bg-gray-300 text-black px-4 py-2 rounded">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deletingVenue)}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-xl mb-4">Your Venues</h2>
            <div className="grid grid-cols-1 gap-4">
                {venues.map((venue) => (
                    <div key={venue.id} className="border p-4 rounded flex justify-between items-start">
                        <div>
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
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => openEditModal(venue)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => openDeleteModal(venue)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
