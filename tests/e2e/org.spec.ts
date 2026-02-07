import { test, expect } from "@playwright/test"

test.describe("Org Creation Page", () => {
  test("renders create-org form with name and timezone fields", async ({
    page,
  }) => {
    // Navigate directly — if user is unauthenticated, this will redirect
    // to /login. This test only verifies the page structure when accessible.
    await page.goto("/create-org")

    // If redirected to login, skip (user not authenticated)
    if (page.url().includes("/login")) {
      test.skip()
      return
    }

    await expect(
      page.getByText("Create your organization")
    ).toBeVisible()
    await expect(page.getByLabel("Organization name")).toBeVisible()
    await expect(page.getByText("Timezone")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Create workspace" })
    ).toBeVisible()
  })

  test("shows validation error for empty org name", async ({ page }) => {
    await page.goto("/create-org")

    if (page.url().includes("/login")) {
      test.skip()
      return
    }

    // Clear any default value and submit
    await page.getByLabel("Organization name").clear()
    await page.getByRole("button", { name: "Create workspace" }).click()

    await expect(
      page.getByText("Organization name is required.")
    ).toBeVisible()
  })

  test("shows validation error for short org name", async ({ page }) => {
    await page.goto("/create-org")

    if (page.url().includes("/login")) {
      test.skip()
      return
    }

    await page.getByLabel("Organization name").fill("A")
    await page.getByRole("button", { name: "Create workspace" }).click()

    await expect(
      page.getByText("Name must be at least 2 characters.")
    ).toBeVisible()
  })

  test("timezone dropdown defaults to London (GMT)", async ({ page }) => {
    await page.goto("/create-org")

    if (page.url().includes("/login")) {
      test.skip()
      return
    }

    await expect(page.getByRole("combobox")).toHaveText("London (GMT)")
  })

  test("form fields are properly labeled for accessibility", async ({
    page,
  }) => {
    await page.goto("/create-org")

    if (page.url().includes("/login")) {
      test.skip()
      return
    }

    await expect(page.getByLabel("Organization name")).toHaveAttribute(
      "id",
      "name"
    )
  })
})
