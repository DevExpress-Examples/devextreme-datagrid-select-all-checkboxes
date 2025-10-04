import {
  useEffect, useRef, useState,
} from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import DataGrid, {
  Column, type DataGridTypes, GroupPanel, Grouping, type DataGridRef, Lookup, Paging, Selection,
} from 'devextreme-react/data-grid';
import GroupSelectionHelper from './GroupRowSelection/GroupRowSelectionHelper';
import GroupRowComponent, { type IGroupRowReadyParameter } from './GroupRowSelection/GroupRowComponent';
import { useEventCallback } from './hooks';

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
const dataSource = AspNetData.createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const customersData = AspNetData.createStore({
  key: 'Value',
  loadUrl: `${url}/CustomersLookup`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const shippersData = AspNetData.createStore({
  key: 'Value',
  loadUrl: `${url}/ShippersLookup`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

function App(): JSX.Element {
  const dataGrid = useRef<DataGridRef>(null);
  const [helper, setHelper] = useState<GroupSelectionHelper>();

  useEffect(() => {
    if (dataGrid?.current) {
      setHelper(new GroupSelectionHelper(dataGrid.current.instance()));
    }
  }, [dataGrid, setHelper]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const groupRowInit = useEventCallback((arg: IGroupRowReadyParameter) => helper?.groupRowInit(arg));

  const groupCellRender = useEventCallback((group: DataGridTypes.ColumnGroupCellTemplateData): JSX.Element => (
    <GroupRowComponent
      groupCellData={group}
      onInitialized={groupRowInit}
    ></GroupRowComponent>
  ));

  return (
    <div className="main">
      <DataGrid
        ref={dataGrid}
        dataSource={dataSource}
        remoteOperations={true}
        width="100%"
        height={600}
        showBorders={true}
      >
        <Selection
          deferred={true}
          mode="multiple"
          allowSelectAll={true}
          showCheckBoxesMode='always'></Selection>
        <Paging pageSize={12}></Paging>
        <GroupPanel visible={true}></GroupPanel>
        <Grouping autoExpandAll={false}></Grouping>
        <Column
          dataField='CustomerID'
          caption="Customer">
          <Lookup
            dataSource={customersData}
            valueExpr="Value"
            displayExpr="Text"></Lookup>
        </Column>
        <Column
          dataField='OrderDate'
          dataType='date'></Column>
        <Column dataField='Freight'></Column>
        <Column
          dataField='ShipCountry'
          groupIndex={0}
          groupCellRender={groupCellRender}
        ></Column>
        <Column
          dataField='ShipVia'
          caption='Shipping Company'
          dataType='number'
          groupIndex={1}
          groupCellRender={groupCellRender}
        >
          <Lookup
            dataSource={shippersData}
            valueExpr="Value"
            displayExpr="Text"></Lookup>
        </Column>
        <Column
          dataField='ShipCity'
          groupIndex={2}
          groupCellRender={groupCellRender}
        ></Column>
      </DataGrid>
    </div>
  );
}

export default App;
