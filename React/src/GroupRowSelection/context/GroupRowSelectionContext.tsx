import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type dxDataGrid from "devextreme/ui/data_grid";

interface GroupRowSelectionContextType {
  selectedRows: Set<string | number>;
  syncSelection: (rowIds: (string | number)[]) => void;
  isGroupLoading: (groupKey: any) => boolean;
  hasAnyLoading: boolean;
  setGroupLoading: (groupKey: any, isLoading: boolean) => void;
  handleGroupSelection: (
    groupKey: any,
    childKeys: any[],
    action: "select" | "deselect",
    gridInstance: dxDataGrid
  ) => Promise<void>;
}

const GroupRowSelectionContext = createContext<
  GroupRowSelectionContextType | undefined
>(undefined);

const serializeKey = (key: any) =>
  typeof key === "string" || typeof key === "number"
    ? String(key)
    : JSON.stringify(key, Object.keys(key).sort());

export const GroupRowSelectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  const [loadingGroupKeys, setLoadingGroupKeys] = useState<Map<string, number>>(
    () => new Map()
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

  const isGroupLoading = useCallback(
    (groupKey: any) => loadingGroupKeys.has(serializeKey(groupKey)),
    [loadingGroupKeys]
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

  const handleGroupSelection = useCallback(
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
    [setGroupLoading]
  );

  return (
    <GroupRowSelectionContext.Provider
      value={{
        selectedRows,
        syncSelection,
        isGroupLoading,
        hasAnyLoading: loadingGroupKeys.size > 0,
        setGroupLoading,
        handleGroupSelection,
      }}
    >
      {children}
    </GroupRowSelectionContext.Provider>
  );
};

export const useGroupRowSelection = () => {
  const context = useContext(GroupRowSelectionContext);
  if (!context) {
    throw new Error(
      "useGroupRowSelection must be used within GroupRowSelectionProvider"
    );
  }
  return context;
};
