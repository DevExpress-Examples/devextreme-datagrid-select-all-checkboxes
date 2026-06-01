import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  useGridInstance,
  useGroupLoading,
  useGroupRowHandler,
  useGroupSelectionHandler,
  useSelectedRows,
} from './hooks';
import type { GroupRowSelectionContextType } from './types';

const GroupRowSelectionContext = createContext<
GroupRowSelectionContextType | undefined
>(undefined);

export function GroupRowSelectionProvider({ children }: { children: ReactNode }): JSX.Element {
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

  const contextValue = useMemo<GroupRowSelectionContextType>(
    () => ({
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
    }),
    [
      selectedRows,
      gridInstanceRef,
      groupedColumnsRef,
      hasAnyLoading,
      syncSelection,
      isGroupLoading,
      setGroupLoading,
      handleGroupSelection,
      registerGrid,
      groupRowInit,
    ],
  );

  return (
    <GroupRowSelectionContext.Provider
      value={contextValue}
    >
      {children}
    </GroupRowSelectionContext.Provider>
  );
}

export function useGroupRowSelection(): GroupRowSelectionContextType {
  const context = useContext(GroupRowSelectionContext);
  if (!context) {
    throw new Error(
      'useGroupRowSelection must be used within GroupRowSelectionProvider',
    );
  }
  return context;
}
