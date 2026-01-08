import React, { createContext, useContext, type ReactNode } from "react";
import {
  useGridInstance,
  useGroupLoading,
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
    hasAnyLoading
  );
  const handleGroupSelection = useGroupSelectionHandler(
    syncSelection,
    setGroupLoading
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
