import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@shared/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="light">
            <head>
                <title>Venue Booking</title>
            </head>
            <body className={`${inter.className} bg-neutral-50 text-neutral-900`}>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
