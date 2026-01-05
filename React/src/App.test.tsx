// GroupRowComponent.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupRowComponent from "./GroupRowSelection/GroupRowComponent";
import type { DataGridTypes } from "devextreme-react/data-grid";
import { vi } from "vitest";
import App from "./App";
import { GroupRowSelectionProvider } from "./GroupRowSelection/context/GroupRowSelectionContext";

describe("GroupRowComponent", () => {
  const mockSelect = vi.fn(() => Promise.resolve());
  const mockDeselect = vi.fn(() => Promise.resolve());
  const mockOnInitialized = vi.fn();

  const mockGroupData: DataGridTypes.ColumnGroupCellTemplateData = {
    column: { caption: "ShipCountry" },
    displayValue: "USA",
    row: { key: ["USA"] },
    component: {
      selectRows: mockSelect,
      deselectRows: mockDeselect,
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render group text", () => {
    render(
      <GroupRowSelectionProvider>
        <GroupRowComponent
          groupCellData={mockGroupData}
          onInitialized={mockOnInitialized}
        />
      </GroupRowSelectionProvider>
    );
    expect(screen.getByText("ShipCountry: USA")).toBeInTheDocument();
  });

  test("calls onInitialized and hides loader", async () => {
    render(
      <GroupRowSelectionProvider>
        <App />
      </GroupRowSelectionProvider>
    );

    await waitFor(
      () => {
        const allCheckboxes = screen.getAllByRole("checkbox");

        allCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeVisible();
        });
      },
      { timeout: 5000 }
    );
  });

  test("selects/deselects rows when checkbox clicked", async () => {
    render(
      <GroupRowSelectionProvider>
        <App />
      </GroupRowSelectionProvider>
    );

    const allCheckboxes = await screen.findAllByRole(
      "checkbox",
      {},
      { timeout: 5000 }
    );
    const checkbox = allCheckboxes[0];
    await userEvent.click(checkbox);

    await waitFor(() => {
      allCheckboxes.forEach((cb) => {
        expect(cb).toHaveAttribute("aria-checked", "true");
      });
    });

    await userEvent.click(checkbox);

    await waitFor(() => {
      allCheckboxes.forEach((cb) => {
        expect(cb).toHaveAttribute("aria-checked", "false");
      });
    });
  });

  test("selecting checkbox at index 1 selects 2–4 and leaves others unselected", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <GroupRowSelectionProvider>
        <App />
      </GroupRowSelectionProvider>
    );

    const allCheckboxes = await waitFor(
      async () => {
        const checkboxes = await screen.findAllByRole("checkbox");
        if (checkboxes.length < 10) throw new Error("Not enough checkboxes");
        return checkboxes;
      },
      { timeout: 15000 }
    );
    await user.click(allCheckboxes[1]);

    const expandButton = container.querySelector(".dx-command-expand div");
    expect(expandButton).toBeInTheDocument();

    await user.click(expandButton!);

    await waitFor(
      async () => {
        const afterSelectionCheckboxes = await waitFor(async () => {
          const checkboxes = await screen.findAllByRole("checkbox");
          if (checkboxes.length < 10) throw new Error("Not enough checkboxes");
          return checkboxes;
        });

        [1, 2, 3, 4].forEach((index) => {
          expect(afterSelectionCheckboxes[index]).toHaveAttribute(
            "aria-checked",
            "true"
          );
        });

        afterSelectionCheckboxes.forEach((cb, index) => {
          if (index < 1) {
            expect(cb).toHaveAttribute("aria-checked", "mixed");
          } else if (index > 4) {
            expect(cb).toHaveAttribute("aria-checked", "false");
          }
        });
      },
      { timeout: 15000 }
    );
  }, 30000);
});
