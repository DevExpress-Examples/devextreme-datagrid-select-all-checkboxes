const { test, expect } = require('@playwright/test');

const GRID_SELECTOR = '.dx-datagrid';
const CHECKBOX_SELECTOR = '.dx-checkbox';
const GROUP_ROW_SELECTOR = '.dx-group-row';
const DATA_ROW_SELECTOR = '.dx-data-row';
const EXPAND_BUTTON_SELECTOR = '.dx-datagrid-group-closed';
const LOAD_INDICATOR_SELECTOR = '.dx-loadindicator';

async function expandAllGroups(page) {
  for (let i = 0; i < 5; i++) {
    const expandButton = page.locator(EXPAND_BUTTON_SELECTOR).first();
    if (await expandButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandButton.click();
      await page.waitForTimeout(1000);
    } else {
      break;
    }
    if (await page.locator(DATA_ROW_SELECTOR).count() > 0) break;
  }
  await page.waitForSelector(DATA_ROW_SELECTOR, { timeout: 15000 });
}

test.describe('DataGrid Group Selection', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector(`${GRID_SELECTOR} ${GROUP_ROW_SELECTOR}`, { timeout: 30000 });
    await page.waitForSelector(`${GROUP_ROW_SELECTOR} ${CHECKBOX_SELECTOR}`, { timeout: 30000 });
  });

  test('grid renders with group rows and checkboxes', async ({ page }) => {
    const groupRows = page.locator(GROUP_ROW_SELECTOR);
    await expect(groupRows.first()).toBeVisible();

    const groupCheckboxes = page.locator(`${GROUP_ROW_SELECTOR} ${CHECKBOX_SELECTOR}`);
    const count = await groupCheckboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('group checkboxes are initially unchecked', async ({ page }) => {
    const groupCheckboxes = page.locator(`${GROUP_ROW_SELECTOR} .dx-checkbox-checked`);
    const checkedCount = await groupCheckboxes.count();
    expect(checkedCount).toBe(0);
  });

  test('clicking a group checkbox selects child rows', async ({ page }) => {
    const firstGroupCheckbox = page.locator(`${GROUP_ROW_SELECTOR} ${CHECKBOX_SELECTOR}`).first();
    await firstGroupCheckbox.click();

    await expect(firstGroupCheckbox).toHaveClass(/dx-checkbox-checked/);

    await expandAllGroups(page);

    const selectedDataRows = page.locator(`${DATA_ROW_SELECTOR} .dx-checkbox-checked`);
    const selectedCount = await selectedDataRows.count();
    expect(selectedCount).toBeGreaterThan(0);
  });

  test('clicking a checked group checkbox deselects child rows', async ({ page }) => {
    const firstGroupCheckbox = page.locator(`${GROUP_ROW_SELECTOR} ${CHECKBOX_SELECTOR}`).first();

      await firstGroupCheckbox.click();
    await expect(firstGroupCheckbox).toHaveClass(/dx-checkbox-checked/);

    await firstGroupCheckbox.click();

    await expect(firstGroupCheckbox).not.toHaveClass(/dx-checkbox-checked/);

    await expandAllGroups(page);

    const selectedDataRows = page.locator(`${DATA_ROW_SELECTOR} .dx-checkbox-checked`);
    const selectedCount = await selectedDataRows.count();
    expect(selectedCount).toBe(0);
  });

  test('selecting individual rows updates group checkbox to indeterminate', async ({ page }) => {
    await expandAllGroups(page);

    const firstDataRowCheckbox = page.locator(`${DATA_ROW_SELECTOR} ${CHECKBOX_SELECTOR}`).first();
    await firstDataRowCheckbox.click();

    await page.waitForTimeout(2000);

    const indeterminateCheckbox = page.locator(`${GROUP_ROW_SELECTOR} .dx-checkbox-indeterminate`);
    const count = await indeterminateCheckbox.count();
    expect(count).toBeGreaterThan(0);
  });

  test('select all header checkbox works', async ({ page }) => {
    const selectAllCheckbox = page.locator('.dx-header-row .dx-checkbox').first();
    await selectAllCheckbox.click();

    await page.waitForTimeout(3000);

    await expandAllGroups(page);

    const dataRows = page.locator(`${DATA_ROW_SELECTOR}`);
    const dataRowCount = await dataRows.count();
    expect(dataRowCount).toBeGreaterThan(0);

    const selectedDataRows = page.locator(`${DATA_ROW_SELECTOR} .dx-checkbox-checked`);
    const selectedCount = await selectedDataRows.count();
    expect(selectedCount).toBe(dataRowCount);
  });

  test('group panel is visible', async ({ page }) => {
    const groupPanel = page.locator('.dx-datagrid-group-panel');
    await expect(groupPanel).toBeVisible();
  });

  test('expanding a group shows nested subgroups', async ({ page }) => {
    const expandButton = page.locator(EXPAND_BUTTON_SELECTOR).first();
    await expandButton.click();

    await page.waitForTimeout(1000);
    const groupRows = page.locator(GROUP_ROW_SELECTOR);
    const count = await groupRows.count();
    expect(count).toBeGreaterThan(1);
  });
});
