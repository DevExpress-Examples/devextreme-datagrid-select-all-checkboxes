import React, { createContext, useContext, type ReactNode } from "react";
import {
  useGridInstance,
  useGroupLoading,
  useGroupRowHandler,
  useGroupSelectionHandler,
  useSelectedRows,
} from "./hooks";
import type { GroupRowSelectionContextType } from "./types";

const GroupRowSelectionContext = createContext<
  GroupRowSelectionContextType | undefined
>(undefined);

export const GroupRowSelectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { setGroupLoading, isGroupLoading, hasAnyLoading } = useGroupLoading();
  const { selectedRows, syncSelection } = useSelectedRows();
  const { gridInstanceRef, groupedColumnsRef, registerGrid } = useGridInstance(
    syncSelection,
    hasAnyLoading,
  );
  const handleGroupSelection = useGroupSelectionHandler(setGroupLoading);
  const { groupRowInit } = useGroupRowHandler(
    gridInstanceRef,
    groupedColumnsRef,
  );

  return (
    <GroupRowSelectionContext.Provider
      value={{
        selectedRows,
        gridInstanceRef,
        groupedColumnsRef,
        hasAnyLoading,
        syncSelection,
        isGroupLoading,
        setGroupLoading,
        handleGroupSelection,
        registerGrid,
        initializeGroupRow: groupRowInit,
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
      "useGroupRowSelection must be used within GroupRowSelectionProvider",
    );
  }
  return context;
};
