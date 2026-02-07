import { BackgroundAnimation } from "@/components/background-animation"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <BackgroundAnimation />
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Operations Hub
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
