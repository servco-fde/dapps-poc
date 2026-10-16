import { expect, test } from '@playwright/test';

test('renders both in-app documentation guides and the reference marker', async ({ page }) => {
  await page.goto('/docs/app');

  await expect(page.getByRole('heading', { name: 'Metric View Hub Guide', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reference implementation', exact: true }).first()).toBeVisible();

  await page.getByRole('tab', { name: 'FDE Reference Guide', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/fde$/);
  await expect(page.getByRole('heading', { name: 'FDE Reference Guide', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Primitive and adaptation map', exact: true })).toBeVisible();
});

test('renders the Microsoft profile page with the current-user profile response', async ({ page }) => {
  await page.route('**/api/microsoft/profile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        displayName: 'Example User',
        email: 'example@servco.com',
        jobTitle: 'Analyst',
        department: 'Digital',
        employeeId: null,
        officeLocation: 'Honolulu',
      }),
    })
  );
  await page.route('**/api/microsoft/profile/photo', (route) => route.fulfill({ status: 404 }));

  await page.goto('/profile');

  await expect(page.getByRole('heading', { name: 'My Microsoft profile' })).toBeVisible();
  await expect(page.getByText('Example User')).toBeVisible();
  await expect(page.getByText('Analyst')).toBeVisible();
  await expect(page.getByText('Not provided')).toBeVisible();
});

test('spaces the photo beside the permission explanation', async ({ page }) => {
  await page.route('**/api/microsoft/profile', (route) =>
    route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'permission_denied' }),
    })
  );
  await page.route('**/api/microsoft/profile/photo', (route) => route.fulfill({ status: 404 }));

  await page.goto('/profile');

  await expect(page.getByText('Profile details need permission')).toBeVisible();
  await expect(page.getByText(/delegated User\.Read permission/)).toBeVisible();
  await expect(page.getByText('ME', { exact: true })).toBeVisible();
  await expect(page.locator('[data-slot="card-content"]')).toHaveCSS('flex-direction', 'row');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-slot="card-content"]')).toHaveCSS('flex-direction', 'column');
});
