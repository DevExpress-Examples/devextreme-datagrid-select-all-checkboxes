import type dxDataGrid from "devextreme/ui/data_grid";
import type { IGroupRowReadyParameter } from "../GroupRowComponent";

export interface GroupRowSelectionContextType {
  selectedRows: Set<string | number>;
  gridInstanceRef: React.MutableRefObject<dxDataGrid<any, any> | null>;
  groupedColumnsRef: React.MutableRefObject<Record<string, any>[]>;
  hasAnyLoading: boolean;
  syncSelection: (rowIds: (string | number)[]) => void;
  isGroupLoading: (groupKey: any) => boolean;
  setGroupLoading: (groupKey: any, isLoading: boolean) => void;
  handleGroupSelection: (
    groupKey: any,
    childKeys: any[],
    action: "select" | "deselect",
    gridInstance: dxDataGrid,
  ) => Promise<void>;
  registerGrid: (grid: dxDataGrid) => void;
  initializeGroupRow: (e: IGroupRowReadyParameter) => Promise<string[]>;
}
