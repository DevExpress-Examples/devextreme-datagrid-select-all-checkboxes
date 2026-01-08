import DataGrid, {
  Column,
  type DataGridTypes,
  GroupPanel,
  Grouping,
  Lookup,
  Paging,
  Selection,
} from "devextreme-react/data-grid";
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import { useEventCallback } from "./hooks";
import { useGroupSelectionHelper } from "./GroupRowSelection/GroupRowSelectionHelper";
import { useGroupRowSelection } from "./GroupRowSelection/selection-context/row-selection-context";
import GroupRowComponent, {
  type IGroupRowReadyParameter,
} from "./GroupRowSelection/GroupRowComponent";

import "./App.css";
import "devextreme/dist/css/dx.material.blue.light.compact.css";

const url = "https://js.devexpress.com/Demos/NetCore/api/DataGridWebApi";
const dataSource = AspNetData.createStore({
  key: "OrderID",
  loadUrl: `${url}/Orders`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const customersData = AspNetData.createStore({
  key: "Value",
  loadUrl: `${url}/CustomersLookup`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const shippersData = AspNetData.createStore({
  key: "Value",
  loadUrl: `${url}/ShippersLookup`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

function App(): JSX.Element {
  const { groupRowInit } = useGroupSelectionHelper();
  const { registerGrid } = useGroupRowSelection();

  const groupRowInitHandler = useEventCallback((arg: IGroupRowReadyParameter) =>
    groupRowInit(arg)
  );

  const groupCellRender = useEventCallback(
    (group: DataGridTypes.ColumnGroupCellTemplateData): JSX.Element => (
      <GroupRowComponent
        groupCellData={group}
        onInitialized={groupRowInitHandler}
      ></GroupRowComponent>
    )
  );

  const handleInitialized = useEventCallback(
    (e: DataGridTypes.InitializedEvent) => {
      if (!e.component) return;

      registerGrid(e.component);
    }
  );

  return (
    <div className="main">
      <DataGrid
        showBorders
        width="100%"
        height={600}
        remoteOperations
        dataSource={dataSource}
        onInitialized={handleInitialized}
      >
        <Selection
          deferred
          allowSelectAll
          mode="multiple"
          showCheckBoxesMode="always"
        ></Selection>
        <Paging pageSize={12}></Paging>
        <GroupPanel visible></GroupPanel>
        <Grouping autoExpandAll={false}></Grouping>
        <Column dataField="CustomerID" caption="Customer">
          <Lookup
            dataSource={customersData}
            valueExpr="Value"
            displayExpr="Text"
          ></Lookup>
        </Column>
        <Column dataField="OrderDate" dataType="date"></Column>
        <Column dataField="Freight"></Column>
        <Column
          dataField="ShipCountry"
          groupIndex={0}
          groupCellRender={groupCellRender}
        ></Column>
        <Column
          dataField="ShipVia"
          caption="Shipping Company"
          dataType="number"
          groupIndex={1}
          groupCellRender={groupCellRender}
        >
          <Lookup
            dataSource={shippersData}
            valueExpr="Value"
            displayExpr="Text"
          ></Lookup>
        </Column>
        <Column
          dataField="ShipCity"
          groupIndex={2}
          groupCellRender={groupCellRender}
        ></Column>
      </DataGrid>
    </div>
  );
}

export default App;
