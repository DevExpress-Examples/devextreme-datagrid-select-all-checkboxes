$(function () {
    let helper = null;
    let columns = [
        {
            dataField: 'ProductID', 
            allowGrouping: false 
        },
        'ProductName', {
            dataField: 'Category.CategoryName',
            caption: 'Category',
            groupIndex: 1
        }, {
            dataField: 'GroupCode',
            groupIndex: 0
        }
    ]

    $("#grid").dxDataGrid({
        dataSource: {
            store: {
                type: 'array',
                key: "ProductID",
                data: myJsonObject
            }
        },
        columns: columns,
        onInitialized: function (e) {
            if (!helper) {
                let grid = e.component
                    // groupFieldNames = [];

                // assignGroupFieldNames(groupFieldNames, columns);
                helper = new GroupSelectionHelper(grid, myJsonObject, "ProductID");
                grid.on("selectionChanged", helper.onGridSelectionChanged);
                grid.option("customizeColumns", helper.onCustomizeColumns);
            }
        },
        groupPanel: {
            visible: true
        },
        remoteOperations: false,
        searchPanel: {
            visible: true,
            width: 240,
            placeholder: "Search...",
            highlightSearchText: true
        },
        headerFilter: {
            visible: true
        },
        rowAlternationEnabled: true,
        paging: {
            pageSize: 8
        },
        pager: {
            visible: true
        },
        selection: {
            mode: 'multiple',
            allowSelectAll: true,
            showCheckBoxesMode: 'always'
        },
        sorting: {
            mode: 'multiple'
        },
        width: '800px',
        height: '450px'
    });
});

// function assignGroupFieldNames(groupFieldNames, columns) {
//     let groupedCols = [];

//     columns.forEach(col => {
//         if(col.hasOwnProperty('groupIndex')) {
//             groupedCols.push(col);
//         }
//     })
//     groupedCols.sort((a, b) => (a.groupIndex > b.groupIndex) ? 1 : -1)
//     groupedCols.forEach(col => {
//         groupFieldNames.push(col.dataField)
//     })

// }