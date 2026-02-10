/* eslint-disable no-unused-vars */
import type dxDataGrid from 'devextreme/ui/data_grid';
import type { IGroupRowReadyParameter } from '../GroupRowComponent';

export interface GroupRowSelectionContextType {
  selectedRows: Set<string | number>;
  gridInstanceRef: React.MutableRefObject<dxDataGrid | null>;
  groupedColumnsRef: React.MutableRefObject<Record<string, any>[]>;
  hasAnyLoading: boolean;
  syncSelection: UseSelectedRowsReturnType['syncSelection'];
  isGroupLoading: UseGroupLoadingReturnType['isGroupLoading'];
  setGroupLoading: UseGroupLoadingReturnType['setGroupLoading'];
  handleGroupSelection: UseGroupSelectionHandlerReturnType;
  registerGrid: UseGridInstanceReturnType['registerGrid'];
  initializeGroupRow: UseGroupRowHandlerReturnType['groupRowInit'];
}

export interface UseSelectedRowsReturnType {
  selectedRows: Set<string | number>;
  syncSelection: (
    keys:
    | (string | number)[]
    | ((prev: (string | number)[]) => (string | number)[]),
  ) => void;
}

export type UseGroupSelectionHandlerReturnType = (groupKey: any, childKeys: any[], action: 'select' | 'deselect', gridInstance: dxDataGrid) => Promise<void>;

export interface UseGridInstanceReturnType {
  gridInstanceRef: React.MutableRefObject<dxDataGrid | null>;
  groupedColumnsRef: React.MutableRefObject<Record<string, any>[]>;
  registerGrid: (grid: dxDataGrid) => void;
}

export interface UseGroupLoadingReturnType {
  isGroupLoading: (groupKey: any) => boolean;
  setGroupLoading: (groupKey: any, isLoading: boolean) => void;
  hasAnyLoading: boolean;
}

export interface UseGroupRowHandlerReturnType {
  groupRowInit: (e: IGroupRowReadyParameter) => Promise<number[]>;
}
