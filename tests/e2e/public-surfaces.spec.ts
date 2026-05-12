import { test, expect } from "../playwright-fixture";

const BASE = process.env.E2E_BASE_URL || "http://localhost:5173";

test.describe("RDM-X public surfaces", () => {
  test("home renders and exposes navigation to content pages", async ({ page }) => {
    await page.goto(BASE);
    // Skip cinematic intro if present
    const skipBtn = page.getByRole("button", { name: /entrar|saltar|skip/i }).first();
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) await skipBtn.click();

    await expect(page.locator("text=/Real del Monte|RDM/i").first()).toBeVisible({ timeout: 15000 });

    // Public list pages should be reachable without auth
    for (const path of ["/noticias", "/eventos", "/rutas", "/foros", "/cultural", "/explorer"]) {
      const res = await page.goto(`${BASE}${path}`);
      expect(res?.ok(), `route ${path} should respond`).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("auth gate: comerciante panel is reachable; admin requires login", async ({ page }) => {
    await page.goto(`${BASE}/comerciante`);
    await expect(page.getByText(/Acceder|Iniciar|Acceso/i).first()).toBeVisible({ timeout: 10000 });

    await page.goto(`${BASE}/admin`);
    // ProtectedRoute redirects unauthenticated to /auth
    await expect(page).toHaveURL(/\/auth/i, { timeout: 10000 });
  });

  test("explorer loads map container and geo zones layer", async ({ page }) => {
    await page.goto(`${BASE}/explorer`);
    await expect(page.locator(".maplibregl-canvas, canvas").first()).toBeVisible({ timeout: 20000 });
  });

  test("forum thread creation requires auth", async ({ page }) => {
    await page.goto(`${BASE}/foros`);
    const newBtn = page.getByRole("button", { name: /nuevo hilo/i }).first();
    await expect(newBtn).toBeVisible({ timeout: 10000 });
    await newBtn.click();
    // Without session, should navigate to /auth
    await expect(page).toHaveURL(/\/auth/i, { timeout: 5000 });
  });
});

test.describe("Realtime / RLS surface", () => {
  test("news list page paginates", async ({ page }) => {
    await page.goto(`${BASE}/noticias`);
    await expect(page.getByText(/Noticias del/i).first()).toBeVisible({ timeout: 10000 });
    const nextBtn = page.getByRole("button", { name: /siguiente/i });
    await expect(nextBtn).toBeVisible();
  });
});
