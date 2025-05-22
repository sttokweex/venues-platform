"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface AuthValues {
    email: string;
    password: string;
}

const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [notification, setNotification] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (
        values: AuthValues,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
    ) => {
        setNotification(null);
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword(values);
            if (error) {
                setNotification(`Error: ${error.message}`);
            } else {
                router.push("/");
            }
        } else {
            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            });
            if (error) {
                setNotification(`Error: ${error.message}`);
            } else {
                setNotification("Check your email for confirmation");
            }
        }
        setSubmitting(false);
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Register"}</h1>
            {notification && (
                <div
                    className={`p-2 mb-4 rounded ${
                        notification.startsWith("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                >
                    {notification}
                </div>
            )}
            <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={validationSchema}
                onSubmit={handleAuth}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium">
                                Email
                            </label>
                            <Field name="email" type="email" className="mt-1 p-2 border rounded w-full" />
                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium">
                                Password
                            </label>
                            <Field name="password" type="password" className="mt-1 p-2 border rounded w-full" />
                            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                        >
                            {isLogin ? "Login" : "Register"}
                        </button>
                    </Form>
                )}
            </Formik>
            <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-blue-500">
                {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </button>
        </div>
    );
}
