$(function () {
    let helper = null;
    $("#grid").dxDataGrid({
        dataSource: {
            store: {
                type: 'array',
                key: "ProductID",
                data: myJsonObject
            }
        },
        columns: [
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
        ],
        onInitialized: function (e) {
            if (!helper) {
                let grid = e.component;
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