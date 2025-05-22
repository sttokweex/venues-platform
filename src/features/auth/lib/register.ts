import { supabase } from "@shared/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

export const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) {
        throw new AuthError(error.message, error.status);
    }
};
