import { expect, type Locator, type Page, test } from "@playwright/test";

const layoutErrorPattern =
  /hydration|hydrated|validateDOMNesting|nested[^\n]*(?:html|body)|(?:html|body)[^\n]*cannot be a descendant/i;

function monitorLayoutErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && layoutErrorPattern.test(message.text())) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (layoutErrorPattern.test(error.message)) errors.push(error.message);
  });
  return errors;
}

async function expectValidDocument(page: Page, errors: string[]) {
  await expect.poll(() => page.locator("html").count()).toBe(1);
  await expect.poll(() => page.locator("body").count()).toBe(1);
  await page.waitForTimeout(250);
  expect(errors).toEqual([]);
}

async function expectPayloadControl(locator: Locator) {
  await expect(locator).toBeVisible();
  const appearance = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const classContext = [element, element.parentElement, element.parentElement?.parentElement]
      .map((node) => node?.className)
      .filter((value): value is string => typeof value === "string")
      .join(" ");

    return {
      height: rect.height,
      fontFamily: style.fontFamily,
      styledClass: /btn|field|input|select|nav|rs__/i.test(classContext),
    };
  });

  expect(appearance.height).toBeGreaterThan(28);
  expect(appearance.fontFamily).not.toBe("");
  expect(appearance.styledClass).toBe(true);
}

async function expectPayloadTheme(page: Page) {
  const themeColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--theme-elevation-0").trim(),
  );
  expect(themeColor).not.toBe("");
}

async function expectSuccessfulNavigation(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `${route} did not return a document response`).not.toBeNull();
  expect(response!.status(), `${route} returned an unsuccessful status`).toBeLessThan(400);
}

async function expectLoginControls(page: Page) {
  const email = page.locator('input[name="email"], input[type="email"]').first();
  const password = page.locator('input[name="password"], input[type="password"]').first();
  const submit = page.getByRole("button", { name: /log in|sign in/i }).first();

  await expectPayloadControl(email);
  await expectPayloadControl(password);
  await expectPayloadControl(submit);
  await expect(submit).toBeEnabled();
}

test.describe("Payload admin rendering", () => {
  test("login has one document, clean hydration, and Payload styling", async ({ page }) => {
    const errors = monitorLayoutErrors(page);
    await expectSuccessfulNavigation(page, "/admin/login");

    await expect(page).toHaveURL(/\/admin\/login(?:\?.*)?$/);
    await expectLoginControls(page);
    await expectPayloadTheme(page);
    await expectValidDocument(page, errors);
  });

  test("create-first-user is state-aware and preserves document invariants", async ({ page }) => {
    const errors = monitorLayoutErrors(page);
    await expectSuccessfulNavigation(page, "/admin/create-first-user");

    const path = new URL(page.url()).pathname;
    if (path === "/admin/login") {
      await expectLoginControls(page);
    } else {
      expect(path).toBe("/admin/create-first-user");
      const name = page.locator('input[name="name"]').first();
      const email = page.locator('input[name="email"], input[type="email"]').first();
      const password = page.locator('input[name="password"], input[type="password"]').first();
      const role = page.locator('#field-role select, #field-role [class*="__control"]').first();
      const create = page.getByRole("button", { name: /^create(?: first user)?$/i }).first();

      await expectPayloadControl(name);
      await expectPayloadControl(email);
      await expectPayloadControl(password);
      await expectPayloadControl(role);
      await expectPayloadControl(create);
      await expect(create).toBeEnabled();
    }

    await expectPayloadTheme(page);
    await expectValidDocument(page, errors);
  });
});

const publicRoutes = [
  { route: "/", content: /Rooted in Aragonda/i },
  { route: "/apply", content: /Application Form/i },
  { route: "/admissions", content: /^Admissions$/i },
];

test.describe("public route smoke coverage", () => {
  for (const { route, content } of publicRoutes) {
    test(`${route} retains public content, footer, global styles, and fonts`, async ({ page }) => {
      await expectSuccessfulNavigation(page, route);

      await expect(page.getByRole("heading", { name: content }).first()).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator("footer")).toContainText("Apollo Vidhyalayam");

      const publicStyles = await page.locator("body").evaluate((body) => {
        const style = getComputedStyle(body);
        return {
          display: style.display,
          bodyFont: style.getPropertyValue("--font-body").trim(),
          displayFont: style.getPropertyValue("--font-display").trim(),
        };
      });
      expect(publicStyles.display).toBe("flex");
      expect(publicStyles.bodyFont).not.toBe("");
      expect(publicStyles.displayFont).not.toBe("");
      await expect(page.locator("html")).toHaveCount(1);
      await expect(page.locator("body")).toHaveCount(1);
    });
  }
});

const adminEmail = process.env.PAYLOAD_TEST_ADMIN_EMAIL;
const adminPassword = process.env.PAYLOAD_TEST_ADMIN_PASSWORD;

test.describe("authenticated Payload admin rendering", () => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set PAYLOAD_TEST_ADMIN_EMAIL and PAYLOAD_TEST_ADMIN_PASSWORD at runtime to run authenticated checks.",
  );

  test("dashboard and admissions form controls remain styled and operable", async ({ page }) => {
    const errors = monitorLayoutErrors(page);
    await expectSuccessfulNavigation(page, "/admin/login");
    await page.locator('input[name="email"], input[type="email"]').first().fill(adminEmail!);
    await page.locator('input[name="password"], input[type="password"]').first().fill(adminPassword!);
    await page.getByRole("button", { name: /log in|sign in/i }).first().click();
    await page.waitForURL(/\/admin\/?(?:\?.*)?$/);

    const admissionsNavigation = page.locator('a[href="/admin/collections/admissions"]').first();
    await expectPayloadControl(admissionsNavigation);
    await admissionsNavigation.click();
    await page.waitForURL(/\/admin\/collections\/admissions\/?(?:\?.*)?$/);
    await expectValidDocument(page, errors);

    await expectSuccessfulNavigation(page, "/admin/collections/admissions/create");
    const studentName = page.locator('input[name="studentName"], #field-studentName input').first();
    await expectPayloadControl(studentName);
    await studentName.fill(`Browser regression ${Date.now()}`);

    const gender = page.locator('#field-gender select, #field-gender [class*="__control"]').first();
    await expectPayloadControl(gender);
    if ((await gender.evaluate((element) => element.tagName)) === "SELECT") {
      await gender.selectOption("male");
    } else {
      await gender.click();
      await page.getByRole("option", { name: "Male", exact: true }).click();
    }

    const status = page.locator('#field-status select, #field-status [class*="__control"]').first();
    await expectPayloadControl(status);
    if ((await status.evaluate((element) => element.tagName)) === "SELECT") {
      await status.selectOption("reviewed");
    } else {
      await status.click();
      await page.getByRole("option", { name: "Reviewed", exact: true }).click();
    }

    const save = page.getByRole("button", { name: /save/i }).first();
    await expectPayloadControl(save);
    await save.click();
    await expect(page).toHaveURL(/\/admin\/collections\/admissions\/create/);
    await expectPayloadTheme(page);
    await expectValidDocument(page, errors);
  });
});
