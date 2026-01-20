import { useState, useCallback, useMemo, useRef } from "react";
import { serializeKey } from "./helpers";
import type dxDataGrid from "devextreme/ui/data_grid";

export const useSelectedRows = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(),
  );

  const syncSelection = useCallback(
    (
      arg:
        | (string | number)[]
        | ((prevSelectedRows: (string | number)[]) => (string | number)[]),
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
    [],
  );

  return { selectedRows, syncSelection };
};

export const useGroupLoading = () => {
  const [loadingGroupKeys, setLoadingGroupKeys] = useState<Map<string, number>>(
    () => new Map(),
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
    (groupKey: any) => {
      if (loadingGroupKeys.has(serializeKey(groupKey))) return true;

      if (Array.isArray(groupKey)) {
        const parentPath = [...groupKey];

        while (parentPath.length > 1) {
          parentPath.pop();

          if (loadingGroupKeys.has(serializeKey(parentPath))) {
            return true;
          }
        }
      }

      return false;
    },
    [loadingGroupKeys],
  );

  const hasAnyLoading = useMemo(
    () => loadingGroupKeys.size > 0,
    [loadingGroupKeys],
  );

  return { setGroupLoading, isGroupLoading, hasAnyLoading };
};

export const useGridInstance = (
  syncSelection: (
    keys:
      | (string | number)[]
      | ((prev: (string | number)[]) => (string | number)[]),
  ) => void,
  hasAnyLoading?: boolean,
) => {
  const gridInstanceRef = useRef<dxDataGrid<any, any> | null>(null);
  const groupedColumnsRef = useRef<Record<string, any>[]>([]);

  const latestRequestIdRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const collectGroupedColumns = useCallback((grid: dxDataGrid) => {
    return grid
      .getVisibleColumns()
      .filter((c) => c.groupIndex != null && c.groupIndex >= 0)
      .sort((a, b) => (a.groupIndex! > b.groupIndex! ? 1 : -1));
  }, []);

  const getSelectedKeys = useCallback((grid: dxDataGrid) => {
    return grid.getSelectedRowKeys();
  }, []);

  const triggerFullSync = useCallback(
    (grid: dxDataGrid) => {
      isFetchingRef.current = true;
      const currentId = ++latestRequestIdRef.current;

      getSelectedKeys(grid)
        .then((keys) => {
          if (latestRequestIdRef.current === currentId) {
            syncSelection(keys);
            isFetchingRef.current = false;
          }
        })
        .catch(() => {
          if (latestRequestIdRef.current === currentId) {
            isFetchingRef.current = false;
          }
        });
    },
    [getSelectedKeys, syncSelection],
  );

  const registerGrid = useCallback(
    (grid: dxDataGrid) => {
      gridInstanceRef.current = grid;
      groupedColumnsRef.current = collectGroupedColumns(grid);

      getSelectedKeys(grid)
        .then((keys: (string | number)[]) => syncSelection(keys))
        .catch(() => {});

      const defaultOptionChanged = grid.option("onOptionChanged");

      grid.option("onOptionChanged", (e) => {
        if (e.fullName === "selectionFilter") {
          const selectAllAction = e.value === null;
          const isDeselectAction =
            e.previousValue?.length > e.value?.length && e.value !== null;

          if (isDeselectAction) syncSelection(e.value);

          if (selectAllAction) {
            triggerFullSync(grid);
          } else {
            if (!hasAnyLoading) {
              grid.getSelectedRowKeys().then((selectedKeys) => {
                syncSelection(selectedKeys);
              });
            }
          }
        }
        if (e.fullName.includes("groupIndex")) {
          groupedColumnsRef.current = collectGroupedColumns(grid);
        }
        defaultOptionChanged?.(e);
      });
    },
    [collectGroupedColumns, getSelectedKeys, syncSelection],
  );

  return { gridInstanceRef, groupedColumnsRef, registerGrid };
};

export const useGroupSelectionHandler = (
  syncSelection: (
    arg:
      | (string | number)[]
      | ((prev: (string | number)[]) => (string | number)[]),
  ) => void,
  setGroupLoading: (groupKey: any, isLoading: boolean) => void,
) => {
  return useCallback(
    async (
      groupKey: any,
      childKeys: any[],
      action: "select" | "deselect",
      gridInstance: dxDataGrid,
    ) => {
      if (!gridInstance) return;
      setGroupLoading(groupKey, true);

      try {
        if (action === "select") {
          await gridInstance.selectRows(childKeys, true);
        } else {
          await gridInstance.deselectRows(childKeys);
        }
      } catch (error) {
        console.error("Group selection failed", error);
      } finally {
        setGroupLoading(groupKey, false);
      }
    },
    [syncSelection, setGroupLoading],
  );
};
