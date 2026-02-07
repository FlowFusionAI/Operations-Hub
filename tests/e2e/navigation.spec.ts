import { test, expect } from "../fixtures/auth"

const NAV_LABELS = [
  "Dashboard",
  "Employees",
  "Templates",
  "Onboarding",
  "Runs",
  "Audit Log",
  "Settings",
]

test.describe("Protected App Layout + Navigation", () => {
  test("sidebar shows all 7 navigation links", async ({ authedPage }) => {
    // After login, user should be on /dashboard or /create-org
    // If on /create-org, navigation tests don't apply — skip
    if (authedPage.url().includes("/create-org")) {
      test.skip()
      return
    }

    for (const label of NAV_LABELS) {
      await expect(authedPage.getByRole("link", { name: label })).toBeVisible()
    }
  })

  test("dashboard page is highlighted as active in sidebar", async ({
    authedPage,
  }) => {
    if (authedPage.url().includes("/create-org")) {
      test.skip()
      return
    }

    await authedPage.goto("/dashboard")
    const dashboardLink = authedPage.getByRole("link", { name: "Dashboard" })
    // Active link should have the accent background class
    await expect(dashboardLink).toHaveClass(/bg-sidebar-accent/)
  })

  test("org name is displayed in sidebar header", async ({ authedPage }) => {
    if (authedPage.url().includes("/create-org")) {
      test.skip()
      return
    }

    // The sidebar should contain the org name (we can't predict the exact text,
    // but we can verify the sidebar header area has text content)
    const sidebar = authedPage.locator("aside")
    await expect(sidebar).toBeVisible()
    // Org name is in a <p> with font-semibold inside the sidebar header
    const orgNameEl = sidebar.locator("p.font-semibold").first()
    await expect(orgNameEl).not.toBeEmpty()
  })

  test("sign out button is visible in sidebar", async ({ authedPage }) => {
    if (authedPage.url().includes("/create-org")) {
      test.skip()
      return
    }

    await expect(
      authedPage.getByRole("button", { name: "Sign out" })
    ).toBeVisible()
  })

  test("dashboard shows welcome message", async ({ authedPage }) => {
    if (authedPage.url().includes("/create-org")) {
      test.skip()
      return
    }

    await authedPage.goto("/dashboard")
    // The dashboard should have some welcome content
    await expect(authedPage.getByText(/welcome/i)).toBeVisible()
  })

  test("clicking nav links navigates to correct pages", async ({
    authedPage,
  }) => {
    if (authedPage.url().includes("/create-org")) {
      test.skip()
      return
    }

    // Click Employees link
    await authedPage.getByRole("link", { name: "Employees" }).click()
    await authedPage.waitForURL("**/employees**")
    expect(authedPage.url()).toContain("/employees")

    // Click back to Dashboard
    await authedPage.getByRole("link", { name: "Dashboard" }).click()
    await authedPage.waitForURL("**/dashboard**")
    expect(authedPage.url()).toContain("/dashboard")
  })
})
