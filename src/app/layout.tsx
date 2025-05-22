import "./globals.css"; // глобальные стили, например Tailwind или другие

export const metadata = {
    title: "Venues Platform",
    description: "Платформа для управления площадками",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
            <head />
            <body>
                <header className="p-4 bg-gray-800 text-white">
                    <h1 className="text-xl font-bold">Venues Platform</h1>
                </header>
                <main>{children}</main>
                <footer className="p-4 text-center text-gray-500">© 2025 Venues Platform</footer>
            </body>
        </html>
    );
}
