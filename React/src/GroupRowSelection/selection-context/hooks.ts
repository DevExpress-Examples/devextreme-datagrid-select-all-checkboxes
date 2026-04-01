import {
  useState, useCallback, useMemo, useRef,
} from 'react';
import type dxDataGrid from 'devextreme/ui/data_grid';
import {
  isItemsArray,
  type LoadOptions,
} from 'devextreme-react/cjs/common/data';
import { serializeKey } from './helpers';
import type {
  UseGridInstanceReturnType,
  UseGroupLoadingReturnType,
  UseGroupRowHandlerReturnType,
  UseGroupSelectionHandlerReturnType,
  UseSelectedRowsReturnType,
} from './types';

export function useSelectedRows(): UseSelectedRowsReturnType {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(),
  );

  const syncSelection = useCallback<UseSelectedRowsReturnType['syncSelection']>(
    (arg) => {
      if (typeof arg === 'function') {
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
}

export function useGroupLoading(): UseGroupLoadingReturnType {
  const [loadingGroupKeys, setLoadingGroupKeys] = useState<Map<string, number>>(
    () => new Map(),
  );

  const setGroupLoading = useCallback((groupKey: any, isLoading: boolean) => {
    const sKey = serializeKey(groupKey);
    setLoadingGroupKeys((prev) => {
      const next = new Map(prev);
      const current = next.get(sKey) ?? 0;

      if (isLoading) {
        next.set(sKey, current + 1);
      } else {
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
}

export function useGridInstance(
  syncSelection: UseSelectedRowsReturnType['syncSelection'],
  hasAnyLoading?: boolean,
): UseGridInstanceReturnType {
  const gridInstanceRef = useRef<dxDataGrid | null>(null);
  const groupedColumnsRef = useRef<Record<string, any>[]>([]);

  const latestRequestIdRef = useRef<number>(0);

  const prevSelectedRowsRef = useRef<Set<string | number>>(new Set());

  const collectGroupedColumns = useCallback(
    (grid: dxDataGrid) => grid
      .getVisibleColumns()
      .filter((c) => c.groupIndex != null && c.groupIndex >= 0)
      .sort((a, b) => ((a.groupIndex ?? 0) > (b.groupIndex ?? 0) ? 1 : -1)),
    [],
  );

  const getSelectedKeys = useCallback(
    (grid: dxDataGrid) => grid.getSelectedRowKeys(),
    [],
  );

  const triggerFullSync = useCallback(
    (grid: dxDataGrid) => {
      const currentId = ++latestRequestIdRef.current;

      getSelectedKeys(grid)
        .then((keys) => {
          if (latestRequestIdRef.current === currentId) {
            syncSelection(keys);
          }
        })
        .catch(() => {});
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

      const defaultOptionChanged = grid.option('onOptionChanged');

      grid.option('onOptionChanged', (e) => {
        if (!prevSelectedRowsRef?.current) return;

        if (e.fullName === 'selectionFilter') {
          const selectAllAction = e.value === null || e.value.length === 0;
          const isDeselectAction = (prevSelectedRowsRef?.current.size ?? 0)
              > e.value?.filter((v: any) => Array.isArray(v))?.length
            && e.value !== null;

          if (isDeselectAction) syncSelection((prev) => Array.from(prev).filter((key) => e.value.some((v: any) => (Array.isArray(v) ? v.includes(key) : v === key))));

          if (selectAllAction) {
            triggerFullSync(grid);
          } else if (!hasAnyLoading && !isDeselectAction) {
            grid.getSelectedRowKeys().then((selectedKeys) => {
              syncSelection(selectedKeys);
            }).catch(() => {});
          }
          prevSelectedRowsRef.current = new Set(e.value);
        }
        if (e.fullName.includes('groupIndex')) {
          groupedColumnsRef.current = collectGroupedColumns(grid);
        }
        defaultOptionChanged?.(e);
      });
    },
    [collectGroupedColumns, getSelectedKeys, syncSelection],
  );

  return { gridInstanceRef, groupedColumnsRef, registerGrid };
}

export function useGroupSelectionHandler(
  setGroupLoading: UseGroupLoadingReturnType['setGroupLoading'],
): UseGroupSelectionHandlerReturnType {
  return useCallback<UseGroupSelectionHandlerReturnType>(
    async (
      groupKey,
      childKeys,
      action,
      gridInstance,
    ) => {
      if (!gridInstance) return;
      setGroupLoading(groupKey, true);

      try {
        if (action === 'select') {
          await gridInstance.selectRows(childKeys, true);
        } else {
          await gridInstance.deselectRows(childKeys);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Group selection failed', error);
      } finally {
        setGroupLoading(groupKey, false);
      }
    },
    [setGroupLoading],
  );
}

export function useGroupRowHandler(
  gridRef: React.RefObject<dxDataGrid>,
  groupedColumnsRef: React.MutableRefObject<Record<string, any>[]>,
): UseGroupRowHandlerReturnType {
  const groupChildKeysRef = useRef<Record<string, any>>({});

  const calcCheckBoxId = useCallback(
    (grid: dxDataGrid, groupRowKey: string[]) => `${grid.element().id}groupCheckBox${groupRowKey.join('')}`,
    [],
  );

  const groupRowInit = useCallback<UseGroupRowHandlerReturnType['groupRowInit']>(
    (arg) => {
      const grid = gridRef.current?.instance();
      if (!grid) return Promise.resolve([]);

      const checkBoxId = calcCheckBoxId(grid, arg.key);

      return new Promise((resolve) => {
        if (groupChildKeysRef.current[checkBoxId]) {
          resolve(groupChildKeysRef.current[checkBoxId]);
          return;
        }

        const filter: string[][] = [];
        arg.key.forEach((key, i) => {
          filter.push([groupedColumnsRef.current[i].dataField, '=', key]);
        });

        const loadOptions: LoadOptions = { filter };
        const store = grid.getDataSource().store();

        store
          .load(loadOptions)
          .then((data) => {
            if (isItemsArray(data)) {
              const keys: number[] = data.map((d) => grid.keyOf(d) as number);
              groupChildKeysRef.current[checkBoxId] = keys;
              resolve(keys);
            } else {
              resolve([]);
            }
          })
          .catch(() => resolve([]));
      });
    },
    [calcCheckBoxId],
  );

  return {
    groupRowInit,
  };
}
