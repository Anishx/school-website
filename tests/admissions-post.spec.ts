import { expect, test } from "@playwright/test";

const requiredAdmission = (identifier: string) => ({
  studentName: `E2E Candidate ${identifier}`,
  grade: "Grade 5",
  dateOfBirth: "2015-06-15",
  gender: "other",
  fatherName: "E2E Parent One",
  motherName: "E2E Parent Two",
  contactNumber: `90000${identifier.slice(-5)}`,
  address: "Synthetic Playwright regression address",
});

type ResponseClassification =
  | "success"
  | "schema-validation"
  | "authorization"
  | "infrastructure"
  | "other";

const classifyResponse = (status: number, body: unknown): ResponseClassification => {
  const responseText = JSON.stringify(body).toLowerCase();
  if (status >= 200 && status < 300) return "success";
  if (
    status === 401 ||
    status === 403 ||
    responseText.includes("unauthorized") ||
    responseText.includes("forbidden") ||
    responseText.includes("not allowed")
  ) return "authorization";
  if (
    status === 400 ||
    status === 422 ||
    responseText.includes("validation") ||
    responseText.includes("required field")
  ) return "schema-validation";
  if (status >= 500) return "infrastructure";
  return "other";
};

const reportClassification = (scenario: string, status: number, body: unknown) => {
  const classification = classifyResponse(status, body);
  console.info(`[admissions regression] ${scenario}: ${classification} (HTTP ${status})`);
  return classification;
};

const responseBody = async (response: { json: () => Promise<unknown> }) =>
  response.json().catch(() => ({}));

test.describe("optional live anonymous admissions API", () => {
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL,
    "Set PLAYWRIGHT_BASE_URL to run live admissions checks against a manually started server.",
  );

  test("creates a schema-valid admission without cookies and denies private operations", async ({ request }) => {
    const identifier = `${Date.now()}-${test.info().workerIndex}`;
    const payload = requiredAdmission(identifier);
    expect(payload).toHaveProperty("contactNumber");
    expect(payload).not.toHaveProperty("parentPhone");

    const response = await request.post("/api/admissions", { data: payload });
    const body = (await responseBody(response)) as Record<string, unknown>;
    expect(reportClassification("valid anonymous create", response.status(), body)).toBe("success");
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
    expect(body).toEqual({ ok: true, reference: expect.any(String) });

    const documentPath = "/api/admissions/synthetic-private-operation-id";
    const privateOperations = [
      ["anonymous read", await request.get(documentPath)],
      ["anonymous update", await request.patch(documentPath, { data: { status: "reviewed" } })],
      ["anonymous delete", await request.delete(documentPath)],
    ] as const;
    for (const [scenario, operationResponse] of privateOperations) {
      const operationBody = await responseBody(operationResponse);
      expect(reportClassification(scenario, operationResponse.status(), operationBody)).toBe("authorization");
      expect([401, 403]).toContain(operationResponse.status());
    }
  });

  test("rejects an anonymous admission missing a required field", async ({ request }) => {
    const identifier = `${Date.now()}-${test.info().workerIndex}`;
    const invalidPayload: Partial<ReturnType<typeof requiredAdmission>> = requiredAdmission(identifier);
    delete invalidPayload.address;

    const response = await request.post("/api/admissions", { data: invalidPayload });
    const body = (await responseBody(response)) as Record<string, unknown>;
    expect(reportClassification("invalid anonymous create", response.status(), body)).toBe("schema-validation");
    expect([400, 422]).toContain(response.status());
    expect(body).not.toHaveProperty("reference");
  });
});
