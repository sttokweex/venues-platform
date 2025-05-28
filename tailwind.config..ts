import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/features/**/*.{js,ts,jsx,tsx}",
        "./src/entities/**/*.{js,ts,jsx,tsx}",
        "./src/shared/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            colors: {
                primary: {
                    500: "#3B82F6",
                    600: "#2563EB",
                },
                secondary: {
                    500: "#10B981",
                    600: "#059669",
                },
                neutral: {
                    50: "#F9FAFB",
                    100: "#F3F4F6",
                    900: "#111827",
                },
            },
            boxShadow: {
                card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in",
                "slide-up": "slideUp 0.3s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [forms],
};

export default config;
