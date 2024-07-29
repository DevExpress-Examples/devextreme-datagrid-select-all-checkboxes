import dxDataGrid from 'devextreme/ui/data_grid';
import { DataGridTypes } from 'devextreme-react/data-grid';
import { LoadOptions } from 'devextreme/data';
import { isItemsArray } from 'devextreme/common/data/custom-store';
import { IGroupRowReadyParameter } from './GroupRowComponent';

export default class GroupSelectionHelper {
  groupedColumns: DataGridTypes.Column[];

  grid: dxDataGrid;

  getSelectedKeysPromise: Promise<any[]> | null;

  selectedKeys: any[] = [];

  groupChildKeys: Record<string, any> = {};

  constructor(grid: dxDataGrid) {
    this.grid = grid;
    this.groupedColumns = this.collectGroupedColumns(grid);
    this.getSelectedKeysPromise = this.getSelectedKeys(grid);
    this.getSelectedKeysPromise.then((keys: any[]) => {
      this.selectedKeys = keys;
    }).catch(() => {});
    const defaultSelectionHandler: Function | undefined = grid.option('onSelectionChanged');
    grid.option('onSelectionChanged', (e: DataGridTypes.SelectionChangedEvent) => {
      this.selectionChanged(e);
      if (defaultSelectionHandler) { defaultSelectionHandler(e); }
    });
    const defaultOptionChangedHandler: Function | undefined = grid.option('onOptionChanged');
    grid.option('onOptionChanged', (e: DataGridTypes.OptionChangedEvent) => {
      if (e.fullName.includes('groupIndex')) {
        this.groupedColumns = this.collectGroupedColumns(grid);
      }
      if (defaultOptionChangedHandler) { defaultOptionChangedHandler(e); }
    });
  }

  groupRowInit(arg: IGroupRowReadyParameter): Promise<any> {
    const checkBoxId = this.calcCheckBoxId(this.grid, arg.key);
    const promise = new Promise<any>((resolve, reject) => {
      if (!this.groupChildKeys[checkBoxId]) {
        const filter: any[] = [];
        arg.key.forEach((key, i) => {
          filter.push([this.groupedColumns[i].dataField, '=', key]);
        });
        const loadOptions: LoadOptions = {
          filter,
        };
        const store = this.grid.getDataSource().store();

        store.load(loadOptions).then((data) => {
          if (isItemsArray(data)) {
            this.groupChildKeys[checkBoxId] = data.map((d) => this.grid.keyOf(d));
            this.getSelectedKeys(this.grid).then((selectedKeys) => {
              const checkedState: boolean | undefined = this.areKeysSelected(this.groupChildKeys[checkBoxId], selectedKeys);
              arg.setCheckedState(checkedState);
            }).catch(() => {});
            resolve(this.groupChildKeys[checkBoxId]);
          }
        }).catch(() => {});
      } else {
        this.getSelectedKeys(this.grid).then((selectedKeys) => {
          const checkedState: boolean | undefined = this.areKeysSelected(this.groupChildKeys[checkBoxId], selectedKeys);
          arg.setCheckedState(checkedState);
          resolve(this.groupChildKeys[checkBoxId]);
        }).catch(() => {});
      }
    });

    return promise;
  }

  selectionChanged(e: DataGridTypes.SelectionChangedEvent): void {
    const groupRows: DataGridTypes.Row[] = e.component.getVisibleRows().filter((r) => r.rowType === 'group');
    this.getSelectedKeysPromise = null;
    if (e.component.option('selection.deferred')) {
      const selectionFilter = e.component.option('selectionFilter');
      if (selectionFilter && selectionFilter.length >= 0) {
        this.repaintGroupRowTree(e.component, groupRows);
      } else {
        e.component.repaintRows(groupRows.map((g) => g.rowIndex));
      }
    } else if (e.selectedRowKeys.length >= e.component.totalCount() || e.currentDeselectedRowKeys.length >= e.component.totalCount()) {
      e.component.repaintRows(groupRows.map((g) => g.rowIndex));
    } else {
      this.repaintGroupRowTree(e.component, groupRows);
    }
  }

  getSelectedKeys(grid: dxDataGrid): Promise<any[]> {
    if (grid.option('selection.deferred')) {
      if (!this.getSelectedKeysPromise) {
        this.getSelectedKeysPromise = grid.getSelectedRowKeys();
      }
      return this.getSelectedKeysPromise;
    }
    return new Promise((resolve) => resolve(grid.getSelectedRowKeys()));
  }

  repaintGroupRowTree(grid: dxDataGrid, groupRows: DataGridTypes.Row[]): void {
    const topGroupRow: DataGridTypes.Row | null = groupRows.filter((r) => r.isExpanded).reduce((acc: DataGridTypes.Row | null, curr) => (!acc || acc.key.length > curr.key.length ? curr : acc), null);
    if (topGroupRow) {
      const affectedGroupRows = groupRows.filter((g) => g.key[0] == topGroupRow.key[0]);
      grid.repaintRows(affectedGroupRows.map((g) => g.rowIndex));
    }
  }

  areKeysSelected(keysToCheck: any[], selectedKeys: any[]): boolean | undefined {
    if (selectedKeys.length == 0) { return false; }
    const intersectionCount = keysToCheck.filter((k) => selectedKeys.includes(k)).length;
    if (intersectionCount === 0) { return false; }
    if (intersectionCount === keysToCheck.length) { return true; }
    return undefined;
  }

  getChildRowKeys(grid: dxDataGrid, groupRowKey: string[]): any[] {
    return this.groupChildKeys[this.calcCheckBoxId(grid, groupRowKey)];
  }

  calcCheckBoxId(grid: dxDataGrid, groupRowKey: string[]): string {
    const gridId: string = grid.element().id;
    return `${gridId}groupCheckBox${groupRowKey.join('')}`;
  }

  collectGroupedColumns(grid: dxDataGrid): DataGridTypes.Column[] {
    const allColumns: DataGridTypes.Column[] = grid.getVisibleColumns();
    return allColumns.filter((c: DataGridTypes.Column) => c.groupIndex != undefined && c.groupIndex >= 0)
      .sort((a, b) => {
        if (!a.groupIndex || !b.groupIndex) return 0;
        return a.groupIndex > b.groupIndex ? 1 : -1;
      });
  }
}
