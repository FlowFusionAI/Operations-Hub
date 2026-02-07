"use client"

import { Suspense, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { login } from "@/lib/actions/auth"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const searchParams = useSearchParams()
  const confirmPending = searchParams.get("confirmed") === "pending"

  function validate(formData: FormData) {
    const newErrors: Record<string, string> = {}
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email) newErrors.email = "Email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email address."

    if (!password) newErrors.password = "Password is required."

    return newErrors
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const validationErrors = validate(formData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card className="border-border/60 shadow-md">
      <CardHeader className="space-y-1.5 pb-2">
        <CardTitle className="text-xl tracking-tight">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {confirmPending && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Check your email for a confirmation link. Once confirmed, log in
              below to continue.
            </p>
          </div>
        )}
        <form id="login-form" onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isPending}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
          <Button type="submit" className="mt-1 w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Log in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
