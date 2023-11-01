import { Component, ViewChild } from '@angular/core';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { IGroupRowReadyParameter } from './GroupRowSelection/group-row-component/group-row.component';
import GroupSelectionHelper from './GroupRowSelection/GroupRowSelectionHelper';
import { localData } from "./localdata";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  dataSource: AspNetData.CustomStore;
  customersData: AspNetData.CustomStore;
  shippersData: AspNetData.CustomStore;

  @ViewChild(DxDataGridComponent) grid!: DxDataGridComponent;
  selectedRowKeys: any[] = [10521];
  selectionFilter: any[] = ["OrderID", "=", 10521];
  helper: GroupSelectionHelper | undefined;
  localData: any[];

  constructor() {
    const url: string = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
    this.localData = localData;
    this.dataSource = AspNetData.createStore({
      key: 'OrderID',
      loadUrl: `${url}/Orders`,
      onBeforeSend(method, ajaxOptions) {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    });
    this.customersData = AspNetData.createStore({
      key: 'Value',
      loadUrl: `${url}/CustomersLookup`,
      onBeforeSend(method, ajaxOptions) {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    });
    this.shippersData = AspNetData.createStore({
      key: 'Value',
      loadUrl: `${url}/ShippersLookup`,
      onBeforeSend(method, ajaxOptions) {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    });
  }
  ngAfterViewInit() {
    this.helper = new GroupSelectionHelper(this.grid.instance);
  }
  groupRowInit(arg: IGroupRowReadyParameter) {
    this.helper?.groupRowInit(arg);
  }
}
