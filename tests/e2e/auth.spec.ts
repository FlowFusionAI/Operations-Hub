import { test, expect } from "@playwright/test"

test.describe("Auth Pages", () => {
  test.describe("Login Page", () => {
    test("renders login form with all fields", async ({ page }) => {
      await page.goto("/login")

      await expect(page.getByText("Welcome back")).toBeVisible()
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByLabel("Password")).toBeVisible()
      await expect(page.getByRole("button", { name: "Log in" })).toBeVisible()
    })

    test("shows validation errors for empty fields", async ({ page }) => {
      await page.goto("/login")
      await page.getByRole("button", { name: "Log in" }).click()

      await expect(page.getByText("Email is required.")).toBeVisible()
      await expect(page.getByText("Password is required.")).toBeVisible()
    })

    test("shows validation error for invalid email", async ({ page }) => {
      await page.goto("/login")
      await page.getByLabel("Email").fill("not-an-email")
      await page.getByLabel("Password").fill("password")
      await page.getByRole("button", { name: "Log in" }).click()

      await expect(
        page.getByText("Enter a valid email address.")
      ).toBeVisible()
    })

    test("has link to signup page", async ({ page }) => {
      await page.goto("/login")
      const signupLink = page.getByRole("link", { name: "Sign up" })
      await expect(signupLink).toBeVisible()
      await expect(signupLink).toHaveAttribute("href", "/signup")
    })

    test("shows email confirmation banner when redirected from signup", async ({
      page,
    }) => {
      await page.goto("/login?confirmed=pending")
      await expect(
        page.getByText("Check your email for a confirmation link")
      ).toBeVisible()
    })

    test("form inputs have associated labels", async ({ page }) => {
      await page.goto("/login")
      // Labels are verified by getByLabel working correctly
      const emailInput = page.getByLabel("Email")
      const passwordInput = page.getByLabel("Password")
      await expect(emailInput).toHaveAttribute("id", "email")
      await expect(passwordInput).toHaveAttribute("id", "password")
    })
  })

  test.describe("Signup Page", () => {
    test("renders signup form with all fields", async ({ page }) => {
      await page.goto("/signup")

      await expect(page.getByText("Create your account")).toBeVisible()
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByLabel("Password", { exact: true })).toBeVisible()
      await expect(page.getByLabel("Confirm password")).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Sign up" })
      ).toBeVisible()
    })

    test("shows validation errors for empty fields", async ({ page }) => {
      await page.goto("/signup")
      await page.getByRole("button", { name: "Sign up" }).click()

      await expect(page.getByText("Email is required.")).toBeVisible()
      await expect(page.getByText("Password is required.")).toBeVisible()
      await expect(
        page.getByText("Please confirm your password.")
      ).toBeVisible()
    })

    test("shows error for short password", async ({ page }) => {
      await page.goto("/signup")
      await page.getByLabel("Email").fill("test@example.com")
      await page.getByLabel("Password", { exact: true }).fill("12345")
      await page.getByLabel("Confirm password").fill("12345")
      await page.getByRole("button", { name: "Sign up" }).click()

      await expect(
        page.getByText("Must be at least 6 characters.")
      ).toBeVisible()
    })

    test("shows error for mismatched passwords", async ({ page }) => {
      await page.goto("/signup")
      await page.getByLabel("Email").fill("test@example.com")
      await page.getByLabel("Password", { exact: true }).fill("Password123!")
      await page.getByLabel("Confirm password").fill("Different123!")
      await page.getByRole("button", { name: "Sign up" }).click()

      await expect(
        page.getByText("Passwords do not match.")
      ).toBeVisible()
    })

    test("has link to login page", async ({ page }) => {
      await page.goto("/signup")
      const loginLink = page.getByRole("link", { name: "Log in" })
      await expect(loginLink).toBeVisible()
      await expect(loginLink).toHaveAttribute("href", "/login")
    })

    test("form inputs have associated labels", async ({ page }) => {
      await page.goto("/signup")
      await expect(page.getByLabel("Email")).toHaveAttribute("id", "email")
      await expect(
        page.getByLabel("Password", { exact: true })
      ).toHaveAttribute("id", "password")
      await expect(page.getByLabel("Confirm password")).toHaveAttribute(
        "id",
        "confirmPassword"
      )
    })
  })

  test.describe("Protected Route Redirects", () => {
    test("unauthenticated user is redirected from /dashboard to /login", async ({
      page,
    }) => {
      await page.goto("/dashboard")
      await page.waitForURL("**/login**", { timeout: 10_000 })
      expect(page.url()).toContain("/login")
    })

    test("unauthenticated user is redirected from /employees to /login", async ({
      page,
    }) => {
      await page.goto("/employees")
      await page.waitForURL("**/login**", { timeout: 10_000 })
      expect(page.url()).toContain("/login")
    })
  })
})
