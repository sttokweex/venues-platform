import "./globals.css";

export const metadata = {
    title: "Venue Booking Platform",
    description: "A demo booking platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-100">{children}</body>
        </html>
    );
}
