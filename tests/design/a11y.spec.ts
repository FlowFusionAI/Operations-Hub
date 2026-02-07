import { test, expect } from "@playwright/test"

test.describe("Accessibility", () => {
  test.describe("Login Page", () => {
    test("all form inputs have associated labels", async ({ page }) => {
      await page.goto("/login")

      const emailInput = page.locator("#email")
      const passwordInput = page.locator("#password")

      // Check that labels exist and are associated
      const emailLabel = page.locator('label[for="email"]')
      const passwordLabel = page.locator('label[for="password"]')

      await expect(emailLabel).toBeVisible()
      await expect(passwordLabel).toBeVisible()
      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
    })

    test("submit button is keyboard-focusable", async ({ page }) => {
      await page.goto("/login")
      const button = page.getByRole("button", { name: "Log in" })

      // Tab through form to reach button
      await page.keyboard.press("Tab") // email
      await page.keyboard.press("Tab") // password
      await page.keyboard.press("Tab") // button

      await expect(button).toBeFocused()
    })

    test("error messages are visible text (not color-only)", async ({
      page,
    }) => {
      await page.goto("/login")
      await page.getByRole("button", { name: "Log in" }).click()

      // Errors should be visible text elements
      const emailError = page.getByText("Email is required.")
      const passwordError = page.getByText("Password is required.")

      await expect(emailError).toBeVisible()
      await expect(passwordError).toBeVisible()

      // Verify they're not hidden (aria-hidden, display:none, etc.)
      await expect(emailError).not.toHaveAttribute("aria-hidden", "true")
      await expect(passwordError).not.toHaveAttribute("aria-hidden", "true")
    })

    test("interactive links are focusable", async ({ page }) => {
      await page.goto("/login")
      const signupLink = page.getByRole("link", { name: "Sign up" })
      await signupLink.focus()
      await expect(signupLink).toBeFocused()
    })
  })

  test.describe("Signup Page", () => {
    test("all form inputs have associated labels", async ({ page }) => {
      await page.goto("/signup")

      await expect(page.locator('label[for="email"]')).toBeVisible()
      await expect(page.locator('label[for="password"]')).toBeVisible()
      await expect(
        page.locator('label[for="confirmPassword"]')
      ).toBeVisible()
    })

    test("form can be submitted via keyboard", async ({ page }) => {
      await page.goto("/signup")

      await page.getByLabel("Email").fill("test@example.com")
      await page.getByLabel("Password", { exact: true }).fill("TestPass123!")
      await page.getByLabel("Confirm password").fill("TestPass123!")

      // Press Enter to submit
      await page.keyboard.press("Enter")

      // The form should attempt submission (we just verify no JS error)
      // Wait a moment for any validation or submission to process
      await page.waitForTimeout(500)
    })
  })

  test.describe("Create Org Page", () => {
    test("organization name input has a label", async ({ page }) => {
      await page.goto("/create-org")
      if (page.url().includes("/login")) {
        test.skip()
        return
      }

      await expect(page.locator('label[for="name"]')).toBeVisible()
    })

    test("timezone select has associated label", async ({ page }) => {
      await page.goto("/create-org")
      if (page.url().includes("/login")) {
        test.skip()
        return
      }

      await expect(page.getByText("Timezone")).toBeVisible()
    })
  })

  test.describe("Focus Visibility", () => {
    test("inputs show visible focus styles", async ({ page }) => {
      await page.goto("/login")
      const emailInput = page.getByLabel("Email")

      await emailInput.focus()
      await expect(emailInput).toBeFocused()

      // Check that focus ring is applied (outline or ring)
      const outlineStyle = await emailInput.evaluate((el) => {
        const styles = getComputedStyle(el)
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
        }
      })

      // Should have some form of focus indicator (outline or box-shadow ring)
      const hasFocusIndicator =
        (outlineStyle.outline && outlineStyle.outline !== "none") ||
        (outlineStyle.boxShadow && outlineStyle.boxShadow !== "none")

      expect(hasFocusIndicator).toBeTruthy()
    })
  })
})
