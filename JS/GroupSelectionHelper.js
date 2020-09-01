class GroupSelectionHelper {
    grid;
    data;
    keyFieldName;
    groupFieldNames;
    customSelectionFlag;

    constructor(grid, data, keyFieldName, groupFieldNames) {
        this.grid = grid;
        this.data = data;
        this.keyFieldName = keyFieldName;
        this.groupFieldNames = groupFieldNames;
        this.customSelectionFlag = false;

        this.onCustomizeColumns = this.onCustomizeColumns.bind(this);
        this.groupCellTemplate = this.groupCellTemplate.bind(this);
        this.onGridSelectionChanged = this.onGridSelectionChanged.bind(this);
    }

    onCustomizeColumns(columns) {
        columns.forEach(col => {
            col.groupCellTemplate = this.groupCellTemplate;
        })
    }

    groupCellTemplate(groupCell, info) {
        let that = this,
            groupedColumnNames = this.getGroupedColumns(that.grid),
            currGroupColumn = [];

        for (let i = 0; i <= info.key.length - 1; i++) {
            currGroupColumn.push(groupedColumnNames[i])
        }
        let rowKeys = this.getKeys(info.data, [], groupedColumnNames, info.key),
            defaultValue = this.checkIfKeysAreSelected(rowKeys, this.grid.getSelectedRowKeys());

        let editorID = this.getEditorName(currGroupColumn, info.key)

        $('<div>')
            .addClass("customSelectionCheckBox")
            .attr("data-keys", JSON.stringify(rowKeys))
            .attr('id', editorID)
            .appendTo(groupCell)
            .dxCheckBox({
                text: info.column.caption + ': ' + info.text,
                value: defaultValue,
                onValueChanged: function (e) {
                    if (that.customSelectionFlag)
                        return;

                    let rowKeys = e.element.data("keys");

                    if (e.value)
                        that.grid.selectRows(rowKeys, true);
                    else
                        that.grid.deselectRows(rowKeys);
                }
            })
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
        let count = 0;

        if (selectedKeys.length == 0)
            return false;

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
        let query = DevExpress.data.query(this.data),
            filterExpr = [];

        for (let i = 0; i < groupValue.length; i++) {
            filterExpr.push([fieldNames[i], "=", groupValue[i]])
        }

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
            
        if (isSelected) {
            selection = grid.getSelectedRowsData();
        }

        if (selection.length == 0) {
            selection = this.data;
        }

        let data = selection.find(e => e[that.keyFieldName] === itemKey);

        if (!data) {
            return null
        }

        let returnVal = ""
        groupedColumnNames.forEach(field => {
            let isFieldObject = field.indexOf('.');
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
                let currItemKey = keys[i]
                    // groupRowValue = this.getGroupRowValue(currGroupColumn, grid, keyValue, isSelected),
                    // editorName = this.getEditorName(currGroupColumn, groupRowValue)

                let editorName = this.getEditorName(currGroupColumn, [], grid, isSelected, currItemKey)

                if (synchronizedCheckBoxes.indexOf(editorName) > -1) // this editor was checked
                    continue;

                synchronizedCheckBoxes.push(editorName);

                let checkBoxEl = $("#" + editorName),
                    value = isSelected,
                    rowKeys = $(checkBoxEl).data("keys");

                if (value && rowKeys)
                    value = this.checkIfKeysAreSelected(rowKeys, keys);

                let editor = $(checkBoxEl).dxCheckBox("instance");

                if (editor)
                    editor.option("value", value);
            }
            
        }
        debugger;
    }

    getGroupRowValue(groupedColumnNames, groupKey, grid, isSelected, itemKey) {

        if(itemKey) {
            let rowIndex = grid.getRowIndexByKey(itemKey),
                groupRowValueStr = "",
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
            let groupRowValueStr = ""

            groupKey.forEach(name => {
                groupRowValueStr += name
            })
            return groupRowValueStr;
        }
        
    }

    getGroupRowKey(groupedColumnNames, groupKey) {
        let groupRowKeyStr = ""
        groupedColumnNames.forEach(name => {
            groupRowKeyStr += name
        })
        groupRowKeyStr = groupRowKeyStr.replace(".", "");

        return groupRowKeyStr
    }

    getEditorName(groupedColumnNames, groupKey, grid, isSelected, itemKey) {
        let groupRowValueStr = this.getGroupRowValue(groupedColumnNames, groupKey, grid, isSelected, itemKey),
            groupRowKeyStr = this.getGroupRowKey(groupedColumnNames, groupKey);

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
