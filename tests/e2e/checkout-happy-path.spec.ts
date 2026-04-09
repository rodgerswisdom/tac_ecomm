import { expect, test } from "@playwright/test";

test("guest checkout happy path (mocked order API)", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "tac-cart",
      JSON.stringify([
        {
          id: "test-product-1",
          productId: "test-product-1",
          name: "Test Product",
          price: 49.99,
          image: "/placeholder.jpg",
          quantity: 1,
        },
      ])
    );
  });

  await page.route("**/api/order", async (route) => {
    const body = route.request().postDataJSON();
    const shippingEmail = typeof body?.email === "string" ? body.email : "";
    if (!shippingEmail) {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Missing email" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        orderId: "test-order-id",
        orderNumber: "TAC-E2E-001",
        redirectUrl:
          "http://127.0.0.1:3000/checkout/thank-you?status=success&orderId=test-order-id",
      }),
    });
  });

  await page.goto("/checkout");

  await page.getByPlaceholder("First Name").fill("Jane");
  await page.getByPlaceholder("Last Name").fill("Doe");
  await page.getByPlaceholder("Email").fill("jane@example.com");
  await page.getByPlaceholder("Address").fill("123 Test Street");
  await page.getByPlaceholder("City").fill("Nairobi");
  await page.getByPlaceholder("State").fill("Nairobi");
  await page.getByPlaceholder("ZIP / Postal Code").fill("00100");

  await page.getByRole("button", { name: "Continue to Delivery" }).click();
  await expect(page.getByText("Delivery Method")).toBeVisible();

  await page.getByRole("button", { name: "Review order" }).click();
  await expect(page.getByText("Review & Confirm")).toBeVisible();

  await page.getByRole("button", { name: "Place Order" }).click();
  await expect(page).toHaveURL(/\/checkout\/thank-you/);
});
