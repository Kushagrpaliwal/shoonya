"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertModal } from "@/components/ui/alert-modal";
import Image from "next/image";

const SignupPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Modal state
    const [alertModal, setAlertModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "info"
    });

    const showAlert = (title, message, variant = "info", redirectOnClose = null) => {
        setAlertModal({ open: true, title, message, variant, redirectOnClose });
    };

    const closeAlert = () => {
        const redirect = alertModal.redirectOnClose;
        setAlertModal(prev => ({ ...prev, open: false }));
        if (redirect) {
            router.push(redirect);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showAlert("Password Mismatch", "Passwords do not match. Please try again.", "error");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert("Account Created", data.message || "Account created successfully!", "success", "/");
            } else {
                showAlert("Signup Failed", data.error || "An error occurred during signup.", "error");
            }
        } catch (error) {
            console.error("Signup error:", error);
            showAlert("Error", "An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
                <Card className="w-full max-w-md bg-white shadow-soft-lg border-0 rounded-2xl">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex flex-row items-center justify-center mb-8 gap-4">
                            <Image
                                src="/image.png"
                                width={56}
                                height={56}
                                alt="UrbanExchange Logo"
                                className="h-14 w-auto"
                            />
                            <span className="text-3xl font-bold text-zinc-900 tracking-tight">UrbanExchange</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center text-zinc-900">
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-center text-zinc-500">
                            Enter your details to get started with trading
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-700 font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 bg-zinc-50 border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-700 font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 bg-zinc-50 border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-zinc-700 font-medium">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 bg-zinc-50 border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : "Create Account"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center pt-2 pb-6">
                        <p className="text-sm text-zinc-500">
                            Already have an account?{" "}
                            <a href="/" className="font-medium text-zinc-900 hover:underline transition-colors">
                                Sign in
                            </a>
                        </p>
                    </CardFooter>
                </Card>
            </div>

            {/* Alert Modal */}
            <AlertModal
                open={alertModal.open}
                onClose={closeAlert}
                title={alertModal.title}
                message={alertModal.message}
                variant={alertModal.variant}
            />
        </>
    );
}

export default SignupPage;
