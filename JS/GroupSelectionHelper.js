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
        $.each(columns, function (_, element) {
            element.groupCellTemplate = this.groupCellTemplate;
        }.bind(this));
    }

    groupCellTemplate(groupCell, info) {
        let that = this;
        let groupedColumnNames = this.getGroupedColumns(that.grid);
        let colField = "",
            keyValuesStr = "";

        for(let i = 0; i <= info.key.length - 1; i++) {
            colField += groupedColumnNames[i]
        }
        info.key.forEach(name => {
            keyValuesStr += name
        })
        colField = colField.replace(".", "");
        let editorID = "groupCheckBox" + colField + keyValuesStr;

        // let rowKeys = this.getKeys(info.data, [], info.column.dataField, info.key);
        let rowKeys = this.getKeys(info.data, [], groupedColumnNames, info.key);
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
                    if (e.value) {
                        that.grid.selectRows(rowKeys, true);
                    }
                    else {
                        that.grid.deselectRows(rowKeys);
                    }
                        
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
            if (childItems) {
                this.getKeys(dataItems[i], keys, groupedColumnNames, groupKey);
            } else
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
        if (currentKeys.length == count)
            return true;
        else
            return undefined;
    }

    getKeysFromDataSource(keys, groupValue, fieldNames) {

        // TODO: use Query.filter instead
        let query = DevExpress.data.query(this.data)
        let filterExpr = []
        for(let i = 0; i < groupValue.length; i++) {
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

    getValueFromArray(grid, keyValue, isSelected, groupedColumnNames) {
        let that = this,
            selection = [];
        //TODO: pass selected/deselected data to this
        if(isSelected) {
            selection = grid.getSelectedRowsData();
        }
        

        if (selection.length == 0) {
            selection = this.data;
        }
            
        let data = $.grep(selection, function (el) { return el[that.keyFieldName] == keyValue })[0];
        if (!data) {
            return null
        }
            
        
        // get value of each dataField in dataFields from the result variable.
        let returnVal = ""
        groupedColumnNames.forEach(field => {
            let isFieldObject = field.indexOf('.');
            if(isFieldObject) {
                let splitFields = field.split("."),
                    tempVal = data;
                for(let i = 0; i < splitFields.length; i++) {
                    tempVal = tempVal[splitFields[i]];
                    if(!(tempVal instanceof Object)) {
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
        let synchronizedCheckBoxes = [];

        // TODO: When a group checkbox is selected, synchronize checkboxes that are not in the same groupIndex level
        // Need to add a currColumnName parameter. How to get this?
        // Test Cases:
        // Case 1: 
        // Check 1 > HandTools
        // Expected output - Check all group CheckBoxes with 1 or 1 > HandTools
        let currGroupColumn= [];

        for (let j = 0; j < groupedColumnNames.length; j++) {
            currGroupColumn.push(groupedColumnNames[j]) // LAST LINE I TOUCHED

            for (let i = 0; i < keys.length; i++) {
                let keyValue = keys[i];
                
                

                let groupRowValue = this.getGroupRowValue(currGroupColumn, grid, keyValue, isSelected)

                //TODO: create function for getting editorName
                let colField = "",
                    keyValuesStr = "";
                currGroupColumn.forEach(name => {
                    colField += name
                })
                colField = colField.replace(".", "");
                let editorName = "groupCheckBox" + colField + groupRowValue;
                

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
        debugger;
        
    }

    getGroupRowValue(groupedColumnNames, grid, keyValue, isSelected) {
        let rowIndex = grid.getRowIndexByKey(keyValue);
        // let columnField = groupedColumnNames[j];

        let groupRowValue = "",
            val;
        if(rowIndex !== -1) {
            groupedColumnNames.forEach(name => {
                val = grid.cellValue(rowIndex, name);
                if(!val) 
                    groupRowValue += val
            })
        }
        
        if (!groupRowValue) {
            groupRowValue = this.getValueFromArray(grid, keyValue, isSelected, groupedColumnNames);
        }
        return groupRowValue;
    }

    onGridSelectionChanged(args) {
        let keys = args.selectedRowKeys;
        let grid = args.component;
        let groupedColumnNames = this.getGroupedColumns(grid);

        if (groupedColumnNames.length == 0)
            return;
        this.customSelectionFlag = true;
        debugger;
        this.synchronizeCheckBoxes(grid, args.currentDeselectedRowKeys, groupedColumnNames, false);
        debugger;
        this.synchronizeCheckBoxes(grid, keys, groupedColumnNames, true);
        this.customSelectionFlag = false;
    }
}
