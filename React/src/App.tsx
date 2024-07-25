import { useEffect, useRef, useState,
} from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import DataGrid, {
  Column, DataGridTypes, GroupPanel, Grouping, Lookup, Paging, Selection,
} from 'devextreme-react/data-grid';
import GroupSelectionHelper from './GroupRowSelection/GroupRowSelectionHelper';
import GroupRowComponent, { IGroupRowReadyParameter } from './GroupRowSelection/GroupRowComponent';

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
const dataSource = AspNetData.createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  onBeforeSend(method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const customersData = AspNetData.createStore({
  key: 'Value',
  loadUrl: `${url}/CustomersLookup`,
  onBeforeSend(method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const shippersData = AspNetData.createStore({
  key: 'Value',
  loadUrl: `${url}/ShippersLookup`,
  onBeforeSend(method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

function App(): JSX.Element {
  const dataGrid = useRef<DataGrid>(null);
  const [helper, setHelper] = useState<GroupSelectionHelper>();

  useEffect(() => {
    setHelper(new GroupSelectionHelper(dataGrid.current!.instance));    

    return () => {
      console.log('Component will unmount');
    };
  }, [dataGrid, setHelper]);

  const groupRowInit = (arg: IGroupRowReadyParameter) => {
    return helper?.groupRowInit(arg);
  };

  
const groupCellRender = (group:DataGridTypes.ColumnGroupCellTemplateData) => {
  return(
    <GroupRowComponent
      groupCellData={group}
      onInitialized={groupRowInit}
    ></GroupRowComponent>
  )
}


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
        <Grouping autoExpandAll={true}></Grouping>
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
