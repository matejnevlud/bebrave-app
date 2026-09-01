"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/icons";
import { setAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, username }),
      });

      const result = (await response.json()) as {
        error?: string;
        role?: string;
      };

      if (!response.ok) {
        setError(result.error || "Invalid username or password");

        return;
      }

      setAuthSession(username, result.role);
      router.push("/admin");
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-4 pb-2">
          <Logo color="black" width="150px" />
          <h1 className="text-2xl font-bold">Admin Login</h1>
        </CardHeader>
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              isRequired
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              isRequired
              label="Password"
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button
              className="w-full"
              color="primary"
              isLoading={isLoading}
              type="submit"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
