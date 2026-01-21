"use client";
import React, { useState, useEffect } from 'react';
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

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const router = useRouter();

  // Modal state
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "info"
  });

  const showAlert = (title, message, variant = "info") => {
    setAlertModal({ open: true, title, message, variant });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        if (data.email) {
          localStorage.setItem("TradingUserEmail", data.email);
          showAlert("Success", data.message, "success");
          setTimeout(() => {
            router.push('/user/watchlist');
          }, 1500);
        } else {
          showAlert("Error", "Email not found in response.", "error");
        }
      } else {
        showAlert("Login Failed", data.error || "An error occurred during login.", "error");
        console.error(data.error);
      }
    } catch (error) {
      showAlert("Error", "An error occurred. Please try again.", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tradingUserEmail = localStorage.getItem("TradingUser Email");
        if (!tradingUserEmail) {
          console.error("No email found in local storage.");
          return;
        }

        const response = await fetch(`/api/getWatchlist?TradingUser Email=${tradingUserEmail}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();

        if (data.exchanges) {
          setWatchlist(data.exchanges.map(exchange => ({
            exchange: exchange.name,
            token: exchange.token
          })));
        } else {
          console.error("No exchanges found in the response.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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
                className="h-14 w-auto rounded-xl"
              />
              <span className="text-3xl font-bold text-zinc-900 tracking-tight">UrbanExchange</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-zinc-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-zinc-500">
              Enter your credentials to access your trading account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="h-12 bg-zinc-50 border-zinc-200 focus:border-primary focus:ring-primary rounded-xl"
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
                  className="h-12 bg-zinc-50 border-zinc-200 focus:border-primary focus:ring-primary rounded-xl"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 btn-primary font-medium transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-6">
            <p className="text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="font-medium text-zinc-900 hover:underline transition-colors">
                Sign up
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

export default LoginPage;