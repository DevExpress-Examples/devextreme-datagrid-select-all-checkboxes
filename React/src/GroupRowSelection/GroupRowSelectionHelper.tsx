import { useRef, useCallback } from "react";
import { useGroupRowSelection } from "./context/GroupRowSelectionContext";
import { isItemsArray } from "devextreme-react/common/data";
import { type LoadOptions } from "devextreme/common/data";
import type dxDataGrid from "devextreme/ui/data_grid";
import { type IGroupRowReadyParameter } from "./GroupRowComponent";

export function useGroupSelectionHelper() {
  const groupChildKeysRef = useRef<Record<string, any>>({});

  const { handleGroupSelection, gridInstanceRef, groupedColumnsRef } =
    useGroupRowSelection();

  const calcCheckBoxId = useCallback(
    (grid: dxDataGrid, groupRowKey: string[]) => {
      return `${grid.element().id}groupCheckBox${groupRowKey.join("")}`;
    },
    []
  );

  const groupRowInit = useCallback(
    (arg: IGroupRowReadyParameter): Promise<any> => {
      const grid = gridInstanceRef.current?.instance();
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

  return {
    groupRowInit,
    getChildRowKeys: (grid: dxDataGrid, key: string[]) =>
      groupChildKeysRef.current[calcCheckBoxId(grid, key)],
    handleGroupSelection,
  };
}
