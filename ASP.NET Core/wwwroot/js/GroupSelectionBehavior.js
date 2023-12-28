class GroupSelectionBehavior {
    skipCheckBoxValueHandling = false;
    rowKeysCache = {};
    cacheGroupRequests = true;
    getSelectedKeysPromise;

    constructor(dataGrid) {
        this.customizeColumns = this.customizeColumns.bind(this);
        this.gridSelectionChanged = this.gridSelectionChanged.bind(this);
        this.groupTemplate = this.groupTemplate.bind(this);
        this.getGroupRowText = this.getGroupRowText.bind(this);
        this.initCheckBox = this.initCheckBox.bind(this);
        this.getSelectedKeys = this.getSelectedKeys.bind(this);
        dataGrid.option("customizeColumns", this.customizeColumns);
        dataGrid.on("selectionChanged", this.gridSelectionChanged);
    }
    customizeColumns(columns) {
        columns.forEach(col => {
          col.groupCellTemplate = this.groupTemplate
        })
    }
    groupTemplate(cellElement, cellData) {
        const flex = $("<div>").addClass("group-row-flex").appendTo(cellElement);
        const checkBoxId = this.calcCheckBoxId(cellData.component.element().attr("id"), cellData.row.key);
        const that = this;
        const checkBox = $("<div>").attr("id", checkBoxId).addClass("group-selection-check-box").appendTo(flex).dxCheckBox({
            visible: false,
            onValueChanged: function(valueArgs) {
                if (that.skipCheckBoxValueHandling) return;
                const childRowKeys = valueArgs.component.option("childRowKeys");
                if (valueArgs.value)
                    cellData.component.selectRows(childRowKeys, true);
                else
                    cellData.component.deselectRows(childRowKeys);
            }
        }).dxCheckBox("instance");
        const loadIndicator = $("<div>").appendTo(flex).addClass("group-selection-check-box").dxLoadIndicator({
          height: 22,
          width: 22
        }).dxLoadIndicator("instance");
        
        this.getSelectedKeys(cellData.component).then((selectedKeys) => {
            if (this.cacheGroupRequests && this.rowKeysCache[checkBoxId]) {
            this.initCheckBox(checkBox, loadIndicator, checkBoxId, selectedKeys);
          } else {
            const groupedColumns = cellData.component.getVisibleColumns().filter(c => c.groupIndex >= 0).sort((a, b) => {
              return a.groupIndex > b.groupIndex ? 1 : -1;
            });
            const filter = [];
            cellData.key.forEach((key, i) => {
              filter.push([groupedColumns[i].dataField, "=", key]);
            });
            const loadOptions = {
                filter
            };
            const store = cellData.component.getDataSource().store();
            store.load(loadOptions).then((data) => {
                const keys = data.map(d => cellData.component.keyOf(d));
                this.rowKeysCache[checkBoxId] = keys;
                debugger
                this.initCheckBox(checkBox, loadIndicator, checkBoxId, selectedKeys);
            });
          }
        });
        flex.append($("<span>").text(this.getGroupRowText(cellData)));
    }
    getGroupRowText(cellData) {
      let text = `${cellData.column.caption}: ${cellData.displayValue}`;
      if (cellData.groupContinuedMessage) text += ` (${cellData.groupContinuedMessage})`;
      if (cellData.groupContinuesMessage) text += ` (${cellData.groupContinuesMessage})`;
      return text;
    }
    initCheckBox(checkBox, loadIndicator, checkBoxId, selectedKeys) {
      this.skipCheckBoxValueHandling = true;
      checkBox.option({
        visible: true,
        value: this.areKeysSelected(this.rowKeysCache[checkBoxId], selectedKeys),
        childRowKeys: this.rowKeysCache[checkBoxId]
      });
      loadIndicator.option("visible", false);
      this.skipCheckBoxValueHandling = false;
    }
    getSelectedKeys(grid) {
      if (grid.option("selection.deferred")) {
        if (!this.getSelectedKeysPromise) {
          this.getSelectedKeysPromise = new Promise(resolve => {
            grid.getSelectedRowKeys().then(selectedKeys => {
                resolve(selectedKeys);
            });
          });
        }
        return this.getSelectedKeysPromise;
      } else {
        return new Promise(resolve => resolve(grid.getSelectedRowKeys()));
      }
    }
    repaintGroupRowTree(grid, groupRows) {
      const topGroupRow = groupRows.filter(r => r.isExpanded).reduce((acc, curr) => {
        return (!acc || acc.key.length > curr.key.length) ? curr : acc;
      }, null);
      if (topGroupRow) {
        const affectedGroupRows = groupRows.filter(g => g.key[0] == topGroupRow.key[0]);
        grid.repaintRows(affectedGroupRows.map(g => g.rowIndex));
      }
    }
    gridSelectionChanged(e) {
      const groupRows = e.component.getVisibleRows().filter(r => r.rowType === "group");
      if (e.component.option("selection.deferred")) {
        this.getSelectedKeysPromise = null;
        if (e.component.option("selectionFilter").length === 0) {
          e.component.repaintRows(groupRows.map(g => g.rowIndex));
        } else {
          this.repaintGroupRowTree(e.component, groupRows);
        }
      } else {
        if (e.selectedRowKeys.length >= e.component.totalCount() || e.currentDeselectedRowKeys.length >= e.component.totalCount()) {
          e.component.repaintRows(groupRows.map(g => g.rowIndex));
        } else {
          this.repaintGroupRowTree(e.component, groupRows);
        }
      }
    }
    calcCheckBoxId(gridId, groupRowKey) {
        return gridId + "groupCheckBox" + groupRowKey.join("");
    }
    areKeysSelected(keysToCheck, selectedKeys) {
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
}