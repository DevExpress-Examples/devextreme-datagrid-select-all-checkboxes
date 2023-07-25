$(function () {
    const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
    function getLookupDataSource(lookupUrl) {
      return DevExpress.data.AspNet.createStore({
        key: 'Value',
        loadUrl: lookupUrl,
        onBeforeSend(method, ajaxOptions) {
          ajaxOptions.xhrFields = { withCredentials: true };
        },
      });
    }
    $("#grid").dxDataGrid({
        onInitialized: function(e) {
          new GroupSelectionBehavior(e.component);
        },
        remoteOperations: true,
        selectedRowKeys: [10521],
        selection: {
            mode: 'multiple',
            allowSelectAll: true,
            showCheckBoxesMode: 'always',
        },
        width: 1200,
        height: 880,
        dataSource: DevExpress.data.AspNet.createStore({
          key: 'OrderID',
          loadUrl: `${url}/Orders`,
          onBeforeSend(method, ajaxOptions) {
            ajaxOptions.xhrFields = { withCredentials: true };
          },
        }),
        columns: [{
          dataField: "OrderID"
        }, {
          dataField: 'CustomerID',
          caption: 'Customer',
          lookup: {
            dataSource: getLookupDataSource(`${url}/CustomersLookup`),
            valueExpr: 'Value',
            displayExpr: 'Text',
          },
        }, {
          dataField: 'OrderDate',
          dataType: 'date',
        }, {
          dataField: 'Freight',
        }, {
          dataField: 'ShipCountry',
          groupIndex: 0,
        }, {
          dataField: 'ShipCity',
          groupIndex: 2,
        }, {
          dataField: 'ShipVia',
          caption: 'Shipping Company',
          groupIndex: 1,
          dataType: 'number',
          lookup: {
            dataSource: getLookupDataSource(`${url}/ShippersLookup`),
            valueExpr: 'Value',
            displayExpr: 'Text',
          },
        }],
        groupPanel: {
          visible: true,
        },
        showBorders: true,
        grouping: {
          autoExpandAll: false,
        },
    });
});