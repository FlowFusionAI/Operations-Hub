import { test as base, type Page } from "@playwright/test"

/**
 * Test user credentials — set these in .env.test.local:
 *   TEST_USER_EMAIL=qa-test@example.com
 *   TEST_USER_PASSWORD=TestPass123!
 *
 * The test user must already exist in Supabase Auth with email confirmed.
 */
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? "qa-test@example.com"
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? "TestPass123!"

export { TEST_USER_EMAIL, TEST_USER_PASSWORD }

/** Login via the UI and wait for redirect to complete */
export async function loginAsTestUser(page: Page) {
  await page.goto("/login")
  await page.getByLabel("Email").fill(TEST_USER_EMAIL)
  await page.getByLabel("Password").fill(TEST_USER_PASSWORD)
  await page.getByRole("button", { name: "Log in" }).click()

  // Wait for navigation away from /login
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 10_000,
  })
}

/** Extended test fixture with authenticated page */
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await loginAsTestUser(page)
    await use(page)
  },
})

export { expect } from "@playwright/test"
