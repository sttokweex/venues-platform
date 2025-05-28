import { supabase } from "@shared/lib/supabase";
import { Profile } from "@entities/profile/model/types";
import { useRouter } from "next/navigation";

export const checkAuth = async (
    router: ReturnType<typeof useRouter>,
    setProfile: (profile: Profile | null) => void,
    setLoading: (loading: boolean) => void
): Promise<boolean> => {
    try {
        setLoading(true);
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
            console.error("Auth error:", userError.message);
            setProfile(null);
            router.push("/auth");
            return false;
        }
        if (!user) {
            console.log("No user found, redirecting to /auth");
            setProfile(null);
            router.push("/auth");
            return false;
        }

        const { data, error } = await supabase.from("profiles").select("role, created_at").eq("id", user.id).single();

        if (error) {
            console.error("Profile fetch error:", error.message, error.details);
            setProfile(null);
            router.push("/auth");
            return false;
        }
        if (!data) {
            console.error("No profile data found for user:", user.id);
            setProfile(null);
            router.push("/auth");
            return false;
        }

        console.log("Profile fetched:", data);
        setProfile(data as Profile);
        const isAdmin = data.role === "admin";
        console.log("Is admin:", isAdmin);
        return isAdmin;
    } catch (err: any) {
        console.error("Error in checkAuth:", err.message);
        setProfile(null);
        router.push("/auth");
        return false;
    } finally {
        setLoading(false);
        console.log("checkAuth completed, loading:", false);
    }
};
