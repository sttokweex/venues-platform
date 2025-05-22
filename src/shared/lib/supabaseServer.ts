import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies(); // await нужен, cookies() возвращает Promise

    // Логируем все куки, которые пришли
    const allCookies = cookieStore.getAll();
    console.log("Cookies from request:", allCookies);

    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            getAll() {
                console.log("getAll called, returning cookies:", allCookies);
                return allCookies.map(({ name, value }) => ({ name, value }));
            },
            setAll(cookiesToSet) {
                try {
                    console.log("setAll called with cookies:", cookiesToSet);
                    // В Server Components нельзя менять куки, обычно это делают в middleware
                    // Здесь можно оставить пустую реализацию
                } catch (error) {
                    console.error("Error in setAll:", error);
                }
            },
        },
    });
}
