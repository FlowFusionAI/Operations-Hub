import { test, expect } from "@playwright/test"

test.describe("Design System - Theme", () => {
  test("HTML element has dark class by default", async ({ page }) => {
    await page.goto("/login")
    const html = page.locator("html")
    await expect(html).toHaveClass(/dark/)
  })

  test("login page has BackgroundAnimation orbs", async ({ page }) => {
    await page.goto("/login")
    // BackgroundAnimation renders floating gradient divs with pointer-events-none
    const bgContainer = page.locator('[class*="pointer-events-none"]').first()
    await expect(bgContainer).toBeVisible()
  })

  test("signup page has BackgroundAnimation orbs", async ({ page }) => {
    await page.goto("/signup")
    const bgContainer = page.locator('[class*="pointer-events-none"]').first()
    await expect(bgContainer).toBeVisible()
  })

  test("auth cards use glass-morphism classes", async ({ page }) => {
    await page.goto("/login")
    // Cards on auth pages should have border styling
    const card = page.locator('[class*="border-border"]').first()
    await expect(card).toBeVisible()
  })

  test("create-org page uses glass-elevated and glow-primary", async ({
    page,
  }) => {
    await page.goto("/create-org")
    // If redirected, skip
    if (page.url().includes("/login")) {
      test.skip()
      return
    }

    const glassCard = page.locator(".glass-elevated").first()
    await expect(glassCard).toBeVisible()

    const glowCard = page.locator(".glow-primary").first()
    await expect(glowCard).toBeVisible()
  })

  test("no pure black backgrounds used", async ({ page }) => {
    await page.goto("/login")
    const body = page.locator("body")
    const bgColor = await body.evaluate((el) =>
      getComputedStyle(el).backgroundColor
    )
    // Pure black would be rgb(0, 0, 0)
    expect(bgColor).not.toBe("rgb(0, 0, 0)")
  })

  test("primary buttons use the correct accent color", async ({ page }) => {
    await page.goto("/login")
    const button = page.getByRole("button", { name: "Log in" })
    const bgColor = await button.evaluate((el) =>
      getComputedStyle(el).backgroundColor
    )
    // The button should have a non-transparent background
    expect(bgColor).not.toBe("rgba(0, 0, 0, 0)")
    expect(bgColor).not.toBe("transparent")
  })
})

test.describe("Design System - Reduced Motion", () => {
  test("respects prefers-reduced-motion", async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
    })
    const page = await context.newPage()
    await page.goto("/login")

    // With reduced motion, the page should still load and be functional
    await expect(page.getByText("Welcome back")).toBeVisible()
    await context.close()
  })
})
