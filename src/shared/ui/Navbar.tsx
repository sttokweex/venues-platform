"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@shared/lib/supabase";
import { Button } from "@shared/ui/Button";
import { User } from "@supabase/supabase-js";

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

                setIsAdmin(profile?.role === "admin");
            }
        };
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    return (
        <nav className="bg-neutral-900 text-neutral-50 py-4 shadow-md">
            <div className="container flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    Venue Booking
                </Link>
                <div className="space-x-4">
                    {user ? (
                        <>
                            <span className="text-neutral-300">Welcome, {user.user_metadata?.name || user.email}</span>
                            {isAdmin && (
                                <Link href="/admin">
                                    <Button variant="secondary" size="sm">
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}
                            <Button variant="primary" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth">
                                <Button variant="primary" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="secondary" size="sm">
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
