"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { Loader2, Building2, Globe } from "lucide-react"
import { toast } from "sonner"
import { createOrganization } from "@/lib/actions/org"
import { pageVariants, cardVariants, transitions } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TIMEZONES = [
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET)" },
  { value: "Europe/Madrid", label: "Madrid (CET)" },
  { value: "Europe/Rome", label: "Rome (CET)" },
  { value: "Europe/Stockholm", label: "Stockholm (CET)" },
  { value: "Europe/Warsaw", label: "Warsaw (CET)" },
  { value: "Europe/Zurich", label: "Zurich (CET)" },
  { value: "Europe/Istanbul", label: "Istanbul (TRT)" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "America/Chicago", label: "Chicago (CST)" },
  { value: "America/Denver", label: "Denver (MST)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "America/Toronto", label: "Toronto (EST)" },
  { value: "America/Sao_Paulo", label: "Sao Paulo (BRT)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Kolkata (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
  { value: "Australia/Melbourne", label: "Melbourne (AEDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT)" },
] as const

export default function CreateOrgPage() {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [timezone, setTimezone] = useState("Europe/London")

  function validate(formData: FormData) {
    const newErrors: Record<string, string> = {}
    const name = (formData.get("name") as string)?.trim()

    if (!name) {
      newErrors.name = "Organization name is required."
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters."
    }

    if (!timezone) {
      newErrors.timezone = "Please select a timezone."
    }

    return newErrors
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("timezone", timezone)

    const validationErrors = validate(formData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    startTransition(async () => {
      const result = await createOrganization(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="glass-elevated glow-primary">
          <CardHeader className="space-y-2 pb-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...transitions.smooth, delay: 0.1 }}
              className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"
            >
              <Building2 className="h-5 w-5 text-primary" />
            </motion.div>
            <CardTitle className="text-center text-xl tracking-tight">
              Create your organization
            </CardTitle>
            <CardDescription className="text-center">
              Set up your workspace to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="create-org-form"
              onSubmit={handleSubmit}
              className="grid gap-5"
            >
              {/* Organization name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Organization name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Acme Corp"
                  autoComplete="organization"
                  autoFocus
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Timezone */}
              <div className="grid gap-2">
                <Label htmlFor="timezone" className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Timezone
                </Label>
                <Select
                  value={timezone}
                  onValueChange={setTimezone}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <p className="text-xs text-destructive">{errors.timezone}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="mt-1 w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating workspace...
                  </>
                ) : (
                  "Create workspace"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
