"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../lib/register";
import { Button } from "@shared/ui/Button";

export const RegisterForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        setLoading(true);
        setError(null);
        try {
            await register(email, password);
            router.push("/"); // Редирект после успешной регистрации
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
            {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 p-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 p-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <Button variant="primary" size="lg" onClick={handleRegister} disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </Button>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline">
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};
