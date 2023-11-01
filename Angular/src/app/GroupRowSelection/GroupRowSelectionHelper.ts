import dxDataGrid from "devextreme/ui/data_grid";
import { DxDataGridTypes } from "devextreme-angular/ui/data-grid";
import { IGroupRowReadyParameter } from './group-row-component/group-row.component';
import { LoadOptions } from 'devextreme/data';
import { isItemsArray } from "devextreme/common/data/custom-store"

export default class GroupSelectionHelper {
    groupedColumns: DxDataGridTypes.Column[];
    grid: dxDataGrid;
    getSelectedKeysPromise: Promise<any[]> | null;
    selectedKeys: any[] = [];
    groupChildKeys: Record<string, any> = {};

    constructor(grid: dxDataGrid) {
        this.grid = grid;
        const allColumns: DxDataGridTypes.Column[] = grid.getVisibleColumns();
        this.groupedColumns = allColumns!.filter((c: DxDataGridTypes.Column) => c.groupIndex != undefined && c.groupIndex >= 0)
          .sort((a, b) => {
            if (!a.groupIndex || !b.groupIndex) return 0;
            return a.groupIndex > b.groupIndex ? 1 : -1;
          }
        );
        this.getSelectedKeysPromise = this.getSelectedKeys(grid);
        this.getSelectedKeysPromise.then((keys: any[]) => {
          this.selectedKeys = keys;
        });
        const defaultCustomizeCallback: Function | undefined = grid.option("customizeColumns");
        grid.option("customizeColumns", (columns: DxDataGridTypes.Column[]) => {
            columns.forEach((column: DxDataGridTypes.Column) => {
              column.groupCellTemplate = "groupCellTemplate";
            });
            if (defaultCustomizeCallback)
                defaultCustomizeCallback(columns);
          }
        )
        const defaultSelectionHandler: Function | undefined = grid.option("onSelectionChanged");
        grid.option("onSelectionChanged", (e: DxDataGridTypes.SelectionChangedEvent) => {
            this.selectionChanged(e);
            if (defaultSelectionHandler)
                defaultSelectionHandler(e);
          }
        )
    }
    groupRowInit(arg: IGroupRowReadyParameter) {
        const checkBoxId = this.calcCheckBoxId(this.grid, arg.key);
        if (!this.groupChildKeys[checkBoxId]) {
            const filter: any[] = [];
            arg.key.forEach((key, i) => {
                filter.push([this.groupedColumns[i].dataField, "=", key]);
            });
            const loadOptions: LoadOptions = {
                filter
            };
            const store = this.grid.getDataSource().store();
            store.load(loadOptions).then((data) => {
              if (isItemsArray(data)) {
                this.groupChildKeys[checkBoxId] = data.map(d => this.grid.keyOf(d));
                this.getSelectedKeys(this.grid).then((selectedKeys) => {
                    const checkedState: boolean | undefined = this.areKeysSelected(this.groupChildKeys[checkBoxId], selectedKeys);
                    arg.component.setCheckedState(checkedState);
                });
              }
            });
        } else {
            this.getSelectedKeys(this.grid).then((selectedKeys) => {
                const checkedState: boolean | undefined = this.areKeysSelected(this.groupChildKeys[checkBoxId], selectedKeys);
                arg.component.setCheckedState(checkedState);
            });
        }
    }
    selectionChanged(e: DxDataGridTypes.SelectionChangedEvent) {
        const groupRows: DxDataGridTypes.Row[] = e.component.getVisibleRows().filter(r => r.rowType === "group");
        this.getSelectedKeysPromise = null;
        if (e.component.option("selection.deferred")) {
          const selectionFilter = e.component.option("selectionFilter");
          if (selectionFilter && selectionFilter.length >= 0) {
            this.repaintGroupRowTree(e.component, groupRows);
          } else {
            e.component.repaintRows(groupRows.map(g => g.rowIndex));
          }
        } else {
          if (e.selectedRowKeys.length >= e.component.totalCount() || e.currentDeselectedRowKeys.length >= e.component.totalCount()) {
            e.component.repaintRows(groupRows.map(g => g.rowIndex));
          } else {
            this.repaintGroupRowTree(e.component, groupRows);
          }
        }
    }
    getSelectedKeys(grid: dxDataGrid): Promise<any[]> {
        if (grid.option("selection.deferred")) {
          if (!this.getSelectedKeysPromise) {
            this.getSelectedKeysPromise = grid.getSelectedRowKeys();
          }
          return this.getSelectedKeysPromise;
        } else {
          return new Promise(resolve => resolve(grid.getSelectedRowKeys()));
        }
    }
    repaintGroupRowTree(grid: dxDataGrid, groupRows: DxDataGridTypes.Row[]) {
        const topGroupRow : DxDataGridTypes.Row | null = groupRows.filter(r => r.isExpanded).reduce((acc: DxDataGridTypes.Row | null, curr) => {
          return (!acc || acc.key.length > curr.key.length) ? curr : acc;
        }, null);
        if (topGroupRow) {
          const affectedGroupRows = groupRows.filter(g => g.key[0] == topGroupRow.key[0]);
          grid.repaintRows(affectedGroupRows.map(g => g.rowIndex));
        }
    }
    areKeysSelected(keysToCheck: any[], selectedKeys: any[]): boolean | undefined {
      if (selectedKeys.length == 0)
        return false;
      const intersectionCount = keysToCheck.filter(k => selectedKeys.indexOf(k) >= 0).length;
      if (intersectionCount === 0)
        return false;
      else if (intersectionCount === keysToCheck.length)
        return true;
      else
        return undefined;
    }
    getChildRowKeys(grid: dxDataGrid, groupRowKey: string[]): any[] {
        return this.groupChildKeys[this.calcCheckBoxId(grid, groupRowKey)];
    }
    calcCheckBoxId(grid: dxDataGrid, groupRowKey: string[]): string {
        const gridId: string = grid.element().id;
        return gridId + "groupCheckBox" + groupRowKey.join("");
    }
}