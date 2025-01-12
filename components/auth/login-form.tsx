"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[LoginForm] Starting login attempt...")
    setError(null)
    setIsLoading(true)

    try {
      console.log("[LoginForm] Calling supabase.auth.signInWithPassword...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("[LoginForm] Sign in response:", { data, error });

      if (error) {
        console.error("[LoginForm] Sign in error:", error);
        throw error;
      }

      if (data.user) {
        console.log("[LoginForm] Sign in successful, user:", data.user);
        console.log("[LoginForm] Session:", data.session);
        console.log("[LoginForm] Redirecting to /chat...");
        router.push('/chat');
      }
    } catch (error: any) {
      console.error("[LoginForm] Caught error:", error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false)
      console.log("[LoginForm] Login attempt completed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

