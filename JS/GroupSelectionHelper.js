class GroupSelectiontestHelper{
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
        var colField = info.column.dataField.replace(".", "");
        var editorID = "groupCheckBox" + colField + info.data.key;         
        var rowKeys = this.getKeys(info.data, [], info.column.dataField);
        let that = this;

        var defaultValue = this.checkIfKeysAreSelected(rowKeys, this.grid.getSelectedRowKeys());
        $('<div>').addClass("customSelectionCheckBox").attr("data-keys", JSON.stringify(rowKeys))
            .attr('id', editorID)
            .appendTo(groupCell)
            .dxCheckBox({
                text: info.column.caption + ': ' + info.text,
                value: defaultValue,
                onValueChanged: function (e) {
                    if (that.customSelectionFlag)
                        return;
                    var rowKeys = e.element.data("keys");
                    if (e.value)
                        that.grid.selectRows(rowKeys, true);
                    else
                        that.grid.deselectRows(rowKeys);
                }
            })
    }

   
    
    

    getGroupedColumns(dataGrid) {
        var colNames = [];
        for (let i = 0; i < dataGrid.columnCount(); i++) {
            if (dataGrid.columnOption(i, "groupIndex") > -1) {
                colNames.push(dataGrid.columnOption(i, "dataField"));
            }
        }
        return colNames;
    }

    getKeys (data, keys, groupedColumnName, groupKey) {
        if (!groupKey)
            groupKey = data.key;
        var dataItems = data.items || data.collapsedItems || data; // check if it's a group row that has nested rows

        for (var i = 0; i < dataItems.length; i++) {
            var childItems = dataItems[i].items || dataItems[i].collapsedItems;
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
        var count = 0;
        if (selectedKeys.length == 0)
            return false;
        for (var i = 0; i < currentKeys.length; i++) {
            var keyValue = currentKeys[i];
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
        var colFields = fieldName.split(".");
        var filteredKeys = $.grep(this.data, function (el) {
            var result = el;
            for (var index = 0; index < colFields.length; index++) {
                var field = colFields[index];
                result = result[field];
                if (!$.isPlainObject(result))
                    break;
            }
            return result == groupValue;
        });
        for (var i = 0; i < filteredKeys.length; i++) {
            var value = filteredKeys[i][this.keyFieldName];
            if (value && keys.indexOf(value) == -1) // invisible key
                keys.push(value);
        }
    }

    getValueFromArray(grid, keyValue, dataField) {
        var selection = grid.getSelectedRowsData();
        let that = this;

        if (selection.length == 0)
            selection = this.data;
        var result = $.grep(selection, function (el) { return el[that.keyFieldName] == keyValue })[0];
        if (!result)
            return null;
        var colFields = dataField.split(".");
        for (var index = 0; index < colFields.length; index++) {
            var field = colFields[index];
            result = result[field];
            if (!$.isPlainObject(result))
                break;
        }
        return result;
    }

    synchronizeCheckBoxes(grid, keys, groupedColumnNames, isSelected) {
        if (!keys || keys.length == 0 || !groupedColumnNames || !grid)
            return;
        var synchronizedCheckBoxes = [];
        for (var j = 0; j < groupedColumnNames.length; j++) {
            for (var i = 0; i < keys.length; i++) {
                var keyValue = keys[i];
                var rowIndex = grid.getRowIndexByKey(keyValue);
                var columnField = groupedColumnNames[j];
                var groupRowValue = grid.cellValue(rowIndex, columnField);
                if (!groupRowValue)
                    groupRowValue = this.getValueFromArray(grid, keyValue, columnField);
                if (groupRowValue == null)
                    continue;
                columnField = columnField.replace(".", "");
                var editorName = "groupCheckBox" + columnField + groupRowValue;
                if (synchronizedCheckBoxes.indexOf(editorName) > -1) // this editor was checked
                    continue;
                synchronizedCheckBoxes.push(editorName);
                var checkBoxEl = $("#" + editorName);
                var value = isSelected;
                var rowKeys = $(checkBoxEl).data("keys");
                if (value && rowKeys)
                    value = this.checkIfKeysAreSelected(rowKeys, keys);
                var editor = $(checkBoxEl).dxCheckBox("instance");
                if (editor)
                    editor.option("value", value);
            }

        }
    }

    onGridSelectionChanged(args) {
        var keys = args.selectedRowKeys;
        var grid = args.component;
        var groupedColumnNames = this.getGroupedColumns(grid);
        if (groupedColumnNames.length == 0)
            return;
        this.customSelectionFlag = true;
        this.synchronizeCheckBoxes(grid, args.currentDeselectedRowKeys, groupedColumnNames, false);
        this.synchronizeCheckBoxes(grid, args.selectedRowKeys, groupedColumnNames, true);
        this.customSelectionFlag = false;

    }

}

function GroupSelectionHelper(grid, data, keyFieldName) {
    var self = this;
    this.grid = grid;
    this.data = data;
    this.keyFieldName = keyFieldName;
    this.customSelectionFlag = false;
    this.onCustomizeColumns = function (columns) {
        $.each(columns, function (_, element) {
            element.groupCellTemplate = self.groupCellTemplate;
        });
    }
    this.groupCellTemplate = function (groupCell, info) {
        var colField = info.column.dataField.replace(".", "");
        var editorID = "groupCheckBox" + colField + info.data.key;         
        var rowKeys = self.getKeys(info.data, [], info.column.dataField);
        var defaultValue = self.checkIfKeysAreSelected(rowKeys, self.grid.getSelectedRowKeys());
        $('<div>').addClass("customSelectionCheckBox").attr("data-keys", JSON.stringify(rowKeys))
            .attr('id', editorID)
            .appendTo(groupCell)
            .dxCheckBox({
                text: info.column.caption + ': ' + info.text,
                value: defaultValue,
                onValueChanged: function (e) {
                    if (self.customSelectionFlag)
                        return;
                    var rowKeys = e.element.data("keys");
                    if (e.value)
                        self.grid.selectRows(rowKeys, true);
                    else
                        self.grid.deselectRows(rowKeys);
                }
            })
    };
    this.getGroupedColumns = function (dataGrid) {
        var colNames = [];
        for (i = 0; i < dataGrid.columnCount(); i++) {
            if (dataGrid.columnOption(i, "groupIndex") > -1) {
                colNames.push(dataGrid.columnOption(i, "dataField"));
            }
        }
        return colNames;
    }
    this.getKeys = function (data, keys, groupedColumnName, groupKey) {
        if (!groupKey)
            groupKey = data.key;
        var dataItems = data.items || data.collapsedItems || data; // check if it's a group row that has nested rows

        for (var i = 0; i < dataItems.length; i++) {
            var childItems = dataItems[i].items || dataItems[i].collapsedItems;
            if (childItems) {
                self.getKeys(dataItems[i], keys, groupedColumnName, groupKey);
            } else
                keys.push(dataItems[i][self.keyFieldName]);
        }
        if (data.isContinuation || data.isContinuationOnNextPage)
            self.getKeysFromDataSource(keys, groupKey, groupedColumnName);

        return keys;
    }
    this.checkIfKeysAreSelected = function (currentKeys, selectedKeys) {
        var count = 0;
        if (selectedKeys.length == 0)
            return false;
        for (var i = 0; i < currentKeys.length; i++) {
            var keyValue = currentKeys[i];
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
    this.getKeysFromDataSource = function (keys, groupValue, fieldName) {
        var colFields = fieldName.split(".");
        var filteredKeys = $.grep(self.data, function (el) {
            var result = el;
            for (var index = 0; index < colFields.length; index++) {
                var field = colFields[index];
                result = result[field];
                if (!$.isPlainObject(result))
                    break;
            }
            return result == groupValue;
        });
        for (var i = 0; i < filteredKeys.length; i++) {
            var value = filteredKeys[i][self.keyFieldName];
            if (value && keys.indexOf(value) == -1) // invisible key
                keys.push(value);
        }
    }
    this.getValueFromArray = function (grid, keyValue, dataField) {
        var selection = grid.getSelectedRowsData();
        if (selection.length == 0)
            selection = self.data;
        var result = $.grep(selection, function (el) { return el[self.keyFieldName] == keyValue })[0];
        if (!result)
            return null;
        var colFields = dataField.split(".");
        for (var index = 0; index < colFields.length; index++) {
            var field = colFields[index];
            result = result[field];
            if (!$.isPlainObject(result))
                break;
        }
        return result;
    }

    this.synchronizeCheckBoxes = function (grid, keys, groupedColumnNames, isSelected) {
        if (!keys || keys.length == 0 || !groupedColumnNames || !grid)
            return;
        var synchronizedCheckBoxes = [];
        for (var j = 0; j < groupedColumnNames.length; j++) {
            for (var i = 0; i < keys.length; i++) {
                var keyValue = keys[i];
                var rowIndex = grid.getRowIndexByKey(keyValue);
                var columnField = groupedColumnNames[j];
                var groupRowValue = grid.cellValue(rowIndex, columnField);
                if (!groupRowValue)
                    groupRowValue = self.getValueFromArray(grid, keyValue, columnField);
                if (groupRowValue == null)
                    continue;
                columnField = columnField.replace(".", "");
                var editorName = "groupCheckBox" + columnField + groupRowValue;
                if (synchronizedCheckBoxes.indexOf(editorName) > -1) // this editor was checked
                    continue;
                synchronizedCheckBoxes.push(editorName);
                var checkBoxEl = $("#" + editorName);
                var value = isSelected;
                var rowKeys = $(checkBoxEl).data("keys");
                if (value && rowKeys)
                    value = self.checkIfKeysAreSelected(rowKeys, keys);
                var editor = $(checkBoxEl).dxCheckBox("instance");
                if (editor)
                    editor.option("value", value);
            }

        }
    }
    this.onGridSelectionChanged = function (args) {
        var keys = args.selectedRowKeys;
        var grid = args.component;
        var groupedColumnNames = self.getGroupedColumns(grid);
        if (groupedColumnNames.length == 0)
            return;
        self.customSelectionFlag = true;
        self.synchronizeCheckBoxes(grid, args.currentDeselectedRowKeys, groupedColumnNames, false);
        self.synchronizeCheckBoxes(grid, args.selectedRowKeys, groupedColumnNames, true);
        self.customSelectionFlag = false;

    }
}