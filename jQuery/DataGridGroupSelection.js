$(function () {
    let helper = null,
        columns = [
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
                helper = new GroupSelectionHelper(e.component, myJsonObject, "ProductID");
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