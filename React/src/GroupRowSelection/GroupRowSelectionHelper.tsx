import { useEffect, useRef, useCallback } from "react";
import { useGroupRowSelection } from "./context/GroupRowSelectionContext";
import { isItemsArray } from "devextreme-react/common/data";
import type { DataGridRef, DataGridTypes } from "devextreme-react/data-grid";
import { type LoadOptions } from "devextreme/common/data";
import type dxDataGrid from "devextreme/ui/data_grid";
import { type IGroupRowReadyParameter } from "./GroupRowComponent";

export function useGroupSelectionHelper() {
  const gridRef = useRef<DataGridRef | null>(null);
  const groupedColumnsRef = useRef<DataGridTypes.Column[]>([]);
  const getSelectedKeysPromiseRef = useRef<Promise<any[]> | null>(null);
  const groupChildKeysRef = useRef<Record<string, any>>({});

  const { syncSelection } = useGroupRowSelection();

  const collectGroupedColumns = useCallback((grid: dxDataGrid) => {
    return grid
      .getVisibleColumns()
      .filter((c) => c.groupIndex != null && c.groupIndex >= 0)
      .sort((a, b) => (a.groupIndex! > b.groupIndex! ? 1 : -1));
  }, []);

  const calcCheckBoxId = useCallback(
    (grid: dxDataGrid, groupRowKey: string[]) => {
      return `${grid.element().id}groupCheckBox${groupRowKey.join("")}`;
    },
    []
  );

  const getSelectedKeys = useCallback((grid: dxDataGrid) => {
    if (grid.option("selection.deferred")) {
      if (!getSelectedKeysPromiseRef.current) {
        getSelectedKeysPromiseRef.current = grid.getSelectedRowKeys();
      }
      return getSelectedKeysPromiseRef.current;
    }
    return grid.getSelectedRowKeys();
  }, []);

  const groupRowInit = useCallback(
    (arg: IGroupRowReadyParameter): Promise<any> => {
      const grid = gridRef.current?.instance();
      if (!grid) return Promise.resolve([]);

      const checkBoxId = calcCheckBoxId(grid, arg.key);

      return new Promise((resolve) => {
        if (groupChildKeysRef.current[checkBoxId]) {
          resolve(groupChildKeysRef.current[checkBoxId]);
          return;
        }

        const filter: any[] = [];
        arg.key.forEach((key, i) => {
          filter.push([groupedColumnsRef.current[i].dataField, "=", key]);
        });

        const loadOptions: LoadOptions = { filter };
        const store = grid.getDataSource().store();

        store
          .load(loadOptions)
          .then((data) => {
            if (isItemsArray(data)) {
              const keys = data.map((d) => grid.keyOf(d));
              groupChildKeysRef.current[checkBoxId] = keys;
              resolve(keys);
            } else {
              resolve([]);
            }
          })
          .catch(() => resolve([]));
      });
    },
    [calcCheckBoxId]
  );

  useEffect(() => {
    const grid = gridRef.current?.instance();
    if (!grid) return;

    groupedColumnsRef.current = collectGroupedColumns(grid);

    getSelectedKeys(grid)
      .then((keys) => syncSelection(keys))
      .catch(() => {});

    const defaultSelectionChanged = grid.option("onSelectionChanged");
    const defaultOptionChanged = grid.option("onOptionChanged");

    grid.option("onSelectionChanged", (e) => {
      getSelectedKeysPromiseRef.current = null;

      getSelectedKeys(e.component).then((keys) => {
        syncSelection(keys);
      });

      defaultSelectionChanged?.(e);
    });

    grid.option("onOptionChanged", (e) => {
      if (e.fullName.includes("groupIndex")) {
        groupedColumnsRef.current = collectGroupedColumns(grid);
      }
      defaultOptionChanged?.(e);
    });
  }, [collectGroupedColumns, getSelectedKeys, syncSelection]);

  return {
    gridRef,
    groupRowInit,
    getChildRowKeys: (grid: dxDataGrid, key: string[]) =>
      groupChildKeysRef.current[calcCheckBoxId(grid, key)],
  };
}
