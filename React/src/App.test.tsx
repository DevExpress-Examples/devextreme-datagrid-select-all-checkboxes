// GroupRowComponent.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DataGridTypes } from 'devextreme-react/data-grid';
import { vi } from 'vitest';
import GroupRowComponent from './GroupRowSelection/GroupRowComponent';
import App from './App';
import { GroupRowSelectionProvider } from './GroupRowSelection/selection-context/row-selection-context';

describe('GroupRowComponent', () => {
  const mockSelect = vi.fn(() => Promise.resolve());
  const mockDeselect = vi.fn(() => Promise.resolve());

  const mockGroupData: DataGridTypes.ColumnGroupCellTemplateData = {
    column: { caption: 'ShipCountry' },
    displayValue: 'USA',
    row: { key: ['USA'] },
    component: {
      selectRows: mockSelect,
      deselectRows: mockDeselect,
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render group text', () => {
    render(
      <GroupRowSelectionProvider>
        <GroupRowComponent groupCellData={mockGroupData} />
      </GroupRowSelectionProvider>,
    );
    expect(screen.getByText('ShipCountry: USA')).toBeInTheDocument();
  });

  // eslint-disable-next-line @typescript-eslint/space-before-function-paren
  test('calls onInitialized and shows checkboxes', async() => {
    render(
      <GroupRowSelectionProvider>
        <App />
      </GroupRowSelectionProvider>,
    );

    await waitFor(
      () => {
        const allCheckboxes = screen.getAllByRole('checkbox');
        expect(allCheckboxes.length).toBeGreaterThan(0);
        allCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeVisible();
        });
      },
      { timeout: 5000 },
    );
  });

  // eslint-disable-next-line @typescript-eslint/space-before-function-paren
  test('selects and deselects rows when checkbox clicked', async() => {
    render(
      <GroupRowSelectionProvider>
        <App />
      </GroupRowSelectionProvider>,
    );

    const allCheckboxes = await waitFor(() => screen.getAllByRole('checkbox'), {
      timeout: 5000,
    });
    const checkbox = allCheckboxes[0];

    await userEvent.click(checkbox);

    await waitFor(() => {
      allCheckboxes.forEach((cb) => {
        expect(cb).toHaveAttribute('aria-checked', 'true');
      });
    });

    await userEvent.click(checkbox);

    await waitFor(() => {
      allCheckboxes.forEach((cb) => {
        expect(cb).toHaveAttribute('aria-checked', 'false');
      });
    });
  });

  // eslint-disable-next-line @typescript-eslint/space-before-function-paren
  test('selecting checkbox at index 1 selects 2–4 and leaves others unselected', async() => {
    const user = userEvent.setup();

    const { container } = render(
      <GroupRowSelectionProvider>
        <App />
      </GroupRowSelectionProvider>,
    );

    const allCheckboxes = await waitFor(
      () => {
        const checkboxes = screen.getAllByRole('checkbox');
        if (checkboxes.length < 10) throw new Error('Grid not loaded');
        return checkboxes;
      },
      { timeout: 15000 },
    );

    await user.click(allCheckboxes[1]);

    await waitFor(() => {
      const freshCheckboxes = screen.getAllByRole('checkbox');
      const state = freshCheckboxes[1].getAttribute('aria-checked');
      if (state !== 'true' && state !== 'mixed') {
        throw new Error('Group checkbox not updated yet');
      }
    });

    const expandButton = container.querySelector('.dx-datagrid-group-closed');

    if (!expandButton) {
      throw new Error('Expand button not found - cannot proceed with test');
    }

    await user.click(expandButton);

    await waitFor(
      () => {
        const checkboxes = screen.getAllByRole('checkbox');

        if (checkboxes.length <= allCheckboxes.length) {
          throw new Error('Rows did not expand yet');
        }

        checkboxes.forEach((cb, index) => {
          const state = cb.getAttribute('aria-checked');

          if (index === 0) {
            expect(['true', 'mixed']).toContain(state);
            return;
          }

          if (index === 1) {
            expect(['true', 'mixed']).toContain(state);
            return;
          }

          if (index > 1 && index <= 4) {
            if (state !== 'true') {
              throw new Error(
                `Row ${index} should be selected but was ${state}`,
              );
            }
            return;
          }

          expect(state).toBe('false');
        });
      },
      { timeout: 10000 },
    );
  }, 30000);
});
