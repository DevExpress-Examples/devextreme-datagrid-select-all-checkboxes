class GroupSelectionHelper {
    grid;
    data;
    keyFieldName;
    customSelectionFlag;

    constructor(grid, data, keyFieldName) {
        this.grid = grid;
        this.data = data;
        this.keyFieldName = keyFieldName;
        this.customSelectionFlag = false;

        this.onCustomizeColumns = this.onCustomizeColumns.bind(this);
        this.groupCellTemplate = this.groupCellTemplate.bind(this);
        this.onGridSelectionChanged = this.onGridSelectionChanged.bind(this);
    }

    onCustomizeColumns(columns) {
        $.each(columns, function (_, element) {
            element.groupCellTemplate = this.groupCellTemplate;
        }.bind(this));
    }

    groupCellTemplate(groupCell, info) {
        let that = this;
        let colField = info.column.dataField.replace(".", "");
        let editorID = "groupCheckBox" + colField + info.data.key;
        let rowKeys = this.getKeys(info.data, [], info.column.dataField);
        let defaultValue = this.checkIfKeysAreSelected(rowKeys, this.grid.getSelectedRowKeys());

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
        let colNames = [];
        for (let i = 0; i < dataGrid.columnCount(); i++) {
            if (dataGrid.columnOption(i, "groupIndex") > -1) {
                colNames.push(dataGrid.columnOption(i, "dataField"));
            }
        }
        return colNames;
    }

    getKeys(data, keys, groupedColumnName, groupKey) {
        if (!groupKey)
            groupKey = data.key;

        let dataItems = data.items || data.collapsedItems || data; // check if it's a group row that has nested rows

        for (let i = 0; i < dataItems.length; i++) {
            let childItems = dataItems[i].items || dataItems[i].collapsedItems;
            if (childItems) {
                this.getKeys(dataItems[i], keys, groupedColumnName, groupKey);
            } else
                keys.push(dataItems[i][this.keyFieldName]);
        }
        if (data.isContinuation || data.isContinuationOnNextPage)
            this.getKeysFromDataSource(keys, groupKey, groupedColumnName);

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
        if (currentKeys.length == count)
            return true;
        else
            return undefined;
    }

    getKeysFromDataSource(keys, groupValue, fieldName) {
        let colFields = fieldName.split(".");
        let filteredKeys = $.grep(this.data, function (el) {
            let result = el;
            for (let index = 0; index < colFields.length; index++) {
                let field = colFields[index];
                result = result[field];
                if (!$.isPlainObject(result))
                    break;
            }
            return result == groupValue;
        });
        for (let i = 0; i < filteredKeys.length; i++) {
            let value = filteredKeys[i][this.keyFieldName];
            if (value && keys.indexOf(value) == -1) // invisible key
                keys.push(value);
        }
    }

    getValueFromArray(grid, keyValue, dataField) {
        let that = this;
        let selection = grid.getSelectedRowsData();

        if (selection.length == 0)
            selection = this.data;
        let result = $.grep(selection, function (el) { return el[that.keyFieldName] == keyValue })[0];
        if (!result)
            return null;
        let colFields = dataField.split(".");
        for (let index = 0; index < colFields.length; index++) {
            let field = colFields[index];
            result = result[field];
            if (!$.isPlainObject(result))
                break;
        }
        return result;
    }

    synchronizeCheckBoxes(grid, keys, groupedColumnNames, isSelected) {
        if (!keys || keys.length == 0 || !groupedColumnNames || !grid)
            return;
        let synchronizedCheckBoxes = [];
        for (let j = 0; j < groupedColumnNames.length; j++) {
            for (let i = 0; i < keys.length; i++) {
                let keyValue = keys[i];
                let rowIndex = grid.getRowIndexByKey(keyValue);
                let columnField = groupedColumnNames[j];
                let groupRowValue = grid.cellValue(rowIndex, columnField);
                if (!groupRowValue)
                    groupRowValue = this.getValueFromArray(grid, keyValue, columnField);
                if (groupRowValue == null)
                    continue;

                columnField = columnField.replace(".", "");
                let editorName = "groupCheckBox" + columnField + groupRowValue;

                if (synchronizedCheckBoxes.indexOf(editorName) > -1) // this editor was checked
                    continue;

                synchronizedCheckBoxes.push(editorName);

                let checkBoxEl = $("#" + editorName);
                let value = isSelected;
                let rowKeys = $(checkBoxEl).data("keys");

                if (value && rowKeys)
                    value = this.checkIfKeysAreSelected(rowKeys, keys);

                let editor = $(checkBoxEl).dxCheckBox("instance");

                if (editor)
                    editor.option("value", value);
            }

        }
    }

    onGridSelectionChanged(args) {
        let keys = args.selectedRowKeys;
        let grid = args.component;
        let groupedColumnNames = this.getGroupedColumns(grid);

        if (groupedColumnNames.length == 0)
            return;

        this.customSelectionFlag = true;
        this.synchronizeCheckBoxes(grid, args.currentDeselectedRowKeys, groupedColumnNames, false);
        this.synchronizeCheckBoxes(grid, args.selectedRowKeys, groupedColumnNames, true);
        this.customSelectionFlag = false;
    }
}
