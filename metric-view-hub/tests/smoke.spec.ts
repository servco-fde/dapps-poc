import { expect, test } from '@playwright/test';
import { z } from 'zod';

const metricRequestSchema = z.object({ measures: z.array(z.string()), dimensions: z.array(z.string()).default([]) });

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

test('switches catalog examples without mixing their queries or member lists', async ({ page }) => {
  const requestedKeys: string[] = [];
  await page.route('**/api/analytics/metric/**', async (route) => {
    const key = new URL(route.request().url()).pathname.split('/').at(-1)!;
    requestedKeys.push(key);
    const { measures, dimensions } = metricRequestSchema.parse(route.request().postDataJSON());
    const row = Object.fromEntries([
      ...measures.map((name): [string, string] => [name, key === 'sample_orders' ? '12345' : '9876']),
      ...dimensions.map((name): [string, string] => [name, name.endsWith('date') ? '1995-01-01' : 'Example category']),
    ]);
    await route.fulfill({
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify({ type: 'result', data: [row] })}\n\n`,
    });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Auto Retail sales and F&I performance' })).toBeVisible();
  await expect(page.getByText('9876', { exact: true }).first()).toBeVisible();
  expect(requestedKeys.every((key) => key === 'auto_retail')).toBe(true);
  requestedKeys.length = 0;

  const selector = page.getByRole('combobox', { name: 'Metric view', exact: true });
  await selector.focus();
  await page.keyboard.press('ArrowDown');
  await page.getByRole('option', { name: 'Sample Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sample Orders sales performance' })).toBeVisible();
  await expect(page.getByText('hawaii_dev.testing.vw__sample_orders_test', { exact: true })).toBeVisible();
  await expect(page.getByText('12345', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('9876', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Orders by market segment', { exact: true })).toBeVisible();
  await expect(page.getByText('Monthly order revenue', { exact: true })).toBeVisible();
  expect(requestedKeys.length).toBeGreaterThanOrEqual(3);
  expect(requestedKeys.every((key) => key === 'sample_orders')).toBe(true);

  await page.getByRole('tab', { name: 'Measures', exact: true }).click();
  await expect(page.getByText('order_count', { exact: true })).toBeVisible();
  await expect(page.getByText('deal_count', { exact: true })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Dimensions', exact: true }).click();
  await expect(page.getByText('market_segment', { exact: true })).toBeVisible();
  await expect(page.getByText('dealership_name', { exact: true })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  requestedKeys.length = 0;
  await selector.click();
  await page.getByRole('option', { name: 'Auto Retail', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Auto Retail sales and F&I performance' })).toBeVisible();
  await expect(page.getByText('9876', { exact: true }).first()).toBeVisible();
  expect(requestedKeys.every((key) => key === 'auto_retail')).toBe(true);
});

test('keeps catalog selection available when Sample Orders has errors or no rows', async ({ page }) => {
  await page.route('**/api/analytics/metric/**', async (route) => {
    const { dimensions } = metricRequestSchema.parse(route.request().postDataJSON());
    const result = dimensions.includes('order_date')
      ? { type: 'error', message: 'Sample Orders query is unavailable' }
      : { type: 'result', data: [] };
    await route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify(result)}\n\n` });
  });
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Metric view', exact: true }).click();
  await page.getByRole('option', { name: 'Sample Orders', exact: true }).click();
  await expect(page.getByText('Sample Orders query is unavailable', { exact: true })).toBeVisible();
  await expect(
    page.getByText('No data returned. Try another metric view or check source access.').first()
  ).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Metric view', exact: true })).toBeEnabled();
  await expect(page.getByText('hawaii_dev.testing.vw__sample_orders_test', { exact: true })).toBeVisible();
});
