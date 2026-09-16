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
