import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/information-system-learning-app/systems/2/nastenka');
  await page.getByRole('button', { name: 'Začít plnit úkoly' }).click();
  await page.getByRole('button', { name: 'Nejstarší účastník Úkol dokončen' }).click();
  await page.locator('div').filter({ hasText: /^Namísto věku nejstaršího účastníka se zobrazuje věk nejmladšího$/ }).click();
  await page.goto('http://localhost:3000/information-system-learning-app/systems/2/nastenka');
});