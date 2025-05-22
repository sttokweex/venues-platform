"use client";

import { useState } from "react";
import { LoginForm } from "@features/auth/ui/LoginForm";
import { RegisterForm } from "@features/auth/ui/RegisterForm";
import { Card } from "@shared/ui/Card";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md">
                {isLogin ? (
                    <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                ) : (
                    <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
                )}
            </Card>
        </div>
    );
}
