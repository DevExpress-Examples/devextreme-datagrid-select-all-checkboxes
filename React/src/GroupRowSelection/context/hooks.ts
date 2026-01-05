import { useState, useCallback, useMemo, useRef } from "react";
import { serializeKey } from "./helpers";
import type dxDataGrid from "devextreme/ui/data_grid";

export const useSelectedRows = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );

  const syncSelection = useCallback(
    (
      arg:
        | (string | number)[]
        | ((prevSelectedRows: (string | number)[]) => (string | number)[])
    ) => {
      if (typeof arg === "function") {
        setSelectedRows((prev) => {
          const newRowIds = arg(Array.from(prev));
          return new Set(newRowIds);
        });
        return;
      }
      setSelectedRows(new Set(arg));
    },
    []
  );

  return { selectedRows, syncSelection };
};

export const useGroupLoading = () => {
  const [loadingGroupKeys, setLoadingGroupKeys] = useState<Map<string, number>>(
    () => new Map()
  );

  const setGroupLoading = useCallback((groupKey: any, isLoading: boolean) => {
    const sKey = serializeKey(groupKey);
    setLoadingGroupKeys((prev) => {
      const next = new Map(prev);
      const current = next.get(sKey) ?? 0;

      if (isLoading) next.set(sKey, current + 1);
      else {
        const nextCount = current - 1;
        if (nextCount <= 0) next.delete(sKey);
        else next.set(sKey, nextCount);
      }
      return next;
    });
  }, []);

  const isGroupLoading = useCallback(
    (groupKey: any) => loadingGroupKeys.has(serializeKey(groupKey)),
    [loadingGroupKeys]
  );

  const hasAnyLoading = useMemo(
    () => loadingGroupKeys.size > 0,
    [loadingGroupKeys]
  );

  return { setGroupLoading, isGroupLoading, hasAnyLoading };
};

export const useGridInstance = (
  syncSelection: (
    keys:
      | (string | number)[]
      | ((prev: (string | number)[]) => (string | number)[])
  ) => void
) => {
  const gridInstanceRef = useRef<dxDataGrid<any, any> | null>(null);
  const groupedColumnsRef = useRef<Record<string, any>[]>([]);
  const getSelectedKeysPromiseRef = useRef<Promise<any[]> | null>(null);

  const collectGroupedColumns = useCallback((grid: dxDataGrid) => {
    return grid
      .getVisibleColumns()
      .filter((c) => c.groupIndex != null && c.groupIndex >= 0)
      .sort((a, b) => (a.groupIndex! > b.groupIndex! ? 1 : -1));
  }, []);

  const getSelectedKeys = useCallback((grid: dxDataGrid) => {
    if (grid.option("selection.deferred")) {
      if (!getSelectedKeysPromiseRef.current) {
        getSelectedKeysPromiseRef.current = grid.getSelectedRowKeys();
      }
      return getSelectedKeysPromiseRef.current;
    }
    return grid.getSelectedRowKeys();
  }, []);

  const registerGrid = useCallback(
    (grid: dxDataGrid) => {
      gridInstanceRef.current = grid;
      groupedColumnsRef.current = collectGroupedColumns(grid);

      getSelectedKeys(grid)
        .then((keys: (string | number)[]) => syncSelection(keys))
        .catch(() => {});

      const defaultSelectionChanged = grid.option("onSelectionChanged");
      const defaultOptionChanged = grid.option("onOptionChanged");

      grid.option("onSelectionChanged", (e) => {
        getSelectedKeysPromiseRef.current = null;
        getSelectedKeys(e.component).then((keys: (string | number)[]) =>
          syncSelection(keys)
        );
        defaultSelectionChanged?.(e);
      });

      grid.option("onOptionChanged", (e) => {
        if (e.fullName.includes("groupIndex")) {
          groupedColumnsRef.current = collectGroupedColumns(grid);
        }
        defaultOptionChanged?.(e);
      });
    },
    [collectGroupedColumns, getSelectedKeys, syncSelection]
  );

  return { gridInstanceRef, groupedColumnsRef, registerGrid };
};

export const useGroupSelectionHandler = (
  syncSelection: (
    arg:
      | (string | number)[]
      | ((prev: (string | number)[]) => (string | number)[])
  ) => void,
  setGroupLoading: (groupKey: any, isLoading: boolean) => void
) => {
  return useCallback(
    async (
      groupKey: any,
      childKeys: any[],
      action: "select" | "deselect",
      gridInstance: dxDataGrid
    ) => {
      if (!gridInstance) return;
      setGroupLoading(groupKey, true);

      try {
        if (action === "select") {
          syncSelection((prevSelectedRows) => {
            const next = new Set(prevSelectedRows);
            childKeys.forEach((key) => next.add(key));
            return Array.from(next);
          });
          await gridInstance.selectRows(childKeys, true);
        } else {
          syncSelection((prevSelectedRows) => {
            const next = new Set(prevSelectedRows);
            childKeys.forEach((key) => next.delete(key));
            return Array.from(next);
          });
          await gridInstance.deselectRows(childKeys);
        }
      } catch (error) {
        console.error("Group selection failed", error);
      } finally {
        setGroupLoading(groupKey, false);
      }
    },
    [syncSelection, setGroupLoading]
  );
};
