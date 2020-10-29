import Query from "devextreme/data/query";
import CheckBox from "devextreme/ui/check_box";
export default class GroupSelectionHelper {
    grid;
    data;
    keyFieldName;
    customSelectionFlag;
    groupCellTemplate;

    constructor(grid, data, keyFieldName) {
        this.grid = grid;
        this.data = data;
        this.keyFieldName = keyFieldName;
        this.customSelectionFlag = false;

        this.onCustomizeColumns = this.onCustomizeColumns.bind(this);
        this.getCheckBoxElementAttr = this.getCheckBoxElementAttr.bind(this);
        this.getCheckBoxValue = this.getCheckBoxValue.bind(this);
        this.checkBoxValueChanged = this.checkBoxValueChanged.bind(this);
        this.groupCellTemplate = 'groupSelectionCellTemplate';
        this.onGridSelectionChanged = this.onGridSelectionChanged.bind(this);

        grid.on("selectionChanged", this.onGridSelectionChanged);
        grid.option("customizeColumns", this.onCustomizeColumns);
    }

    onCustomizeColumns(columns) {
        columns.forEach(col => {
            col.groupCellTemplate = this.groupCellTemplate;
        })
    }

    getCheckBoxText(info) {
        return info.column.caption + ': ' + info.text
    }

    getCheckBoxValue(info) {
        const groupedColumnNames = this.getGroupedColumns(this.grid),
              groupKey = info.key,
              rowKeys = this.getKeys(info.data, [], groupedColumnNames, groupKey),
              defaultValue = this.checkIfKeysAreSelected(rowKeys, this.grid.getSelectedRowKeys());
    
          return defaultValue;
      }

    getCheckBoxElementAttr(info) {
        const groupedColumnNames = this.getGroupedColumns(this.grid),
          groupKey = info.key,
          rowKeys = this.getKeys(info.data, [], groupedColumnNames, groupKey);
        let currGroupColumn = [];
    
        for (let i = 0; i <= info.key.length - 1; i++) {
          currGroupColumn.push(groupedColumnNames[i])
        }
    
        const editorID = this.getEditorName(currGroupColumn, groupKey, null, null, null)
    
        return {
          class: "customSelectionCheckBox",
          id: editorID,
          "data-keys": JSON.stringify(rowKeys)
        }
      }

    checkBoxValueChanged(e) {
        if (this.customSelectionFlag)
            return;

        let rowKeys = JSON.parse(e.element.dataset.keys);

        if (e.value) 
            this.grid.selectRows(rowKeys, true);
        else
            this.grid.deselectRows(rowKeys);
    }

    getGroupedColumns(dataGrid) {
        let colNames = [],
            groupedColumns = [],
            groupIndex = null;

        for (let i = 0; i < dataGrid.columnCount(); i++) {
            groupIndex = dataGrid.columnOption(i, "groupIndex")
            if (groupIndex > -1) {
                groupedColumns.push({
                    dataField: dataGrid.columnOption(i, "dataField"),
                    groupIndex
                });
            }
        }

        groupedColumns.sort((a, b) => (a.groupIndex > b.groupIndex) ? 1 : -1)
        groupedColumns.forEach(col => {
            colNames.push(col.dataField);
        })
        return colNames;
    }

    getKeys(data, keys, groupedColumnNames, groupKey) {
        if (!groupKey)
            groupKey = data.key;

        let dataItems = data.items || data.collapsedItems || data; // check if it's a group row that has nested rows

        for (let i = 0; i < dataItems.length; i++) {
            let childItems = dataItems[i].items || dataItems[i].collapsedItems;
            if (childItems)
                this.getKeys(dataItems[i], keys, groupedColumnNames, groupKey);
            else
                keys.push(dataItems[i][this.keyFieldName]);
        }

        if (data.isContinuation || data.isContinuationOnNextPage)
            this.getKeysFromDataSource(keys, groupKey, groupedColumnNames);

        return keys;
    }

    checkIfKeysAreSelected(currentKeys, selectedKeys) {
        if (selectedKeys.length == 0)
            return false;

        let count = 0;
        for (let i = 0; i < currentKeys.length; i++) {
            let keyValue = currentKeys[i];
            if (selectedKeys.indexOf(keyValue) > -1) // key is not selected
                count++;
        }

        if (count == 0)
            return false;
        else if (currentKeys.length == count)
            return true;
        else
            return undefined;
    }

    getKeysFromDataSource(keys, groupValue, fieldNames) {
        let query = Query(this.data),
            filterExpr = [];

        for (let i = 0; i < groupValue.length; i++) 
            filterExpr.push([fieldNames[i], "=", groupValue[i]])

        let filteredKeys = query
            .filter(filterExpr)
            .toArray();

        for (let i = 0; i < filteredKeys.length; i++) {
            let value = filteredKeys[i][this.keyFieldName];
            if (value && keys.indexOf(value) == -1) // invisible key
                keys.push(value);
        }

    }

    getValueFromArray(groupedColumnNames, grid, itemKey, isSelected) {
        let that = this,
            selection = [];

        if (isSelected) 
            selection = grid.getSelectedRowsData();
    
        if (selection.length == 0) 
            selection = this.data;
        
        let data = selection.find(e => e[that.keyFieldName] === itemKey);
        if (!data) 
            return null
        
        let returnVal = ""
        groupedColumnNames.forEach(field => {
            let isFieldObject = field.indexOf('.'); // Check if field name is like "Field1.Field2.myValue"
            if (isFieldObject) {
                let splitFields = field.split("."),
                    tempVal = data;
                for (let i = 0; i < splitFields.length; i++) {
                    tempVal = tempVal[splitFields[i]];
                    if (!(tempVal instanceof Object)) {
                        break;
                    }
                }
                returnVal += tempVal;
            } else {
                returnVal += data[field]
            }
        })
        return returnVal
    }

    synchronizeCheckBoxes(grid, keys, groupedColumnNames, isSelected) {
        if (!keys || keys.length == 0 || !groupedColumnNames || !grid)
            return;

        let synchronizedCheckBoxes = [],
            currGroupColumn = [];

        for (let j = 0; j < groupedColumnNames.length; j++) {
            currGroupColumn.push(groupedColumnNames[j])

            for (let i = 0; i < keys.length; i++) {
                let currItemKey = keys[i],
                    editorName = this.getEditorName(currGroupColumn, [], grid, isSelected, currItemKey)

                if (synchronizedCheckBoxes.indexOf(editorName) > -1) // this editor was checked
                    continue;

                synchronizedCheckBoxes.push(editorName);

                let checkBoxEl: any = document.querySelector("#" + editorName),
                    value = isSelected;
                    
                if(!checkBoxEl) 
                    continue;

                let rowKeys = JSON.parse(checkBoxEl.dataset.keys);

                if (value && rowKeys)
                    value = this.checkIfKeysAreSelected(rowKeys, keys);

                let editor = CheckBox.getInstance(checkBoxEl);

                if (editor)
                    editor.option("value", value);
            }
        }
    }

    getGroupRowValue(groupedColumnNames, groupKey, grid, isSelected, itemKey) {
        let groupRowValueStr = ""

        if (itemKey && grid && isSelected !== undefined) {
            let rowIndex = grid.getRowIndexByKey(itemKey),
                val;

            if (rowIndex !== -1) {
                groupedColumnNames.forEach(name => {
                    val = grid.cellValue(rowIndex, name);
                    if (!val)
                        groupRowValueStr += val
                })
            }

            if (!groupRowValueStr)
                groupRowValueStr = this.getValueFromArray(groupedColumnNames, grid, itemKey, isSelected);

            return groupRowValueStr;
        } else {
            groupKey.forEach(name => {
                groupRowValueStr += name
            })
            return groupRowValueStr;
        }
    }

    getGroupRowKey(groupedColumnNames) {
        let groupRowKeyStr = ""

        groupedColumnNames.forEach(name => {
            groupRowKeyStr += name
        })
        groupRowKeyStr = groupRowKeyStr.replace(".", "");

        return groupRowKeyStr;
    }

    getEditorName(groupedColumnNames, groupKey, grid, isSelected, itemKey) {
        let groupRowValueStr = this.getGroupRowValue(groupedColumnNames, groupKey, grid, isSelected, itemKey),
            groupRowKeyStr = this.getGroupRowKey(groupedColumnNames);

        return "groupCheckBox" + groupRowKeyStr + groupRowValueStr;
    }

    onGridSelectionChanged(args) {
        let keys = args.selectedRowKeys,
            grid = args.component,
            groupedColumnNames = this.getGroupedColumns(grid);

        if (groupedColumnNames.length == 0)
            return;

        this.customSelectionFlag = true;
        this.synchronizeCheckBoxes(grid, args.currentDeselectedRowKeys, groupedColumnNames, false);
        this.synchronizeCheckBoxes(grid, keys, groupedColumnNames, true);
        this.customSelectionFlag = false;
    }
}
