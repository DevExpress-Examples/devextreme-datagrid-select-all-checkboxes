import { Component, ViewChild } from '@angular/core';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import {DxDataGridComponent, DxDataGridModule} from 'devextreme-angular/ui/data-grid';
import type { IGroupRowReadyParameter } from './GroupRowSelection/group-row-component/group-row.component';
import GroupSelectionHelper from './GroupRowSelection/GroupRowSelectionHelper';
import { localData } from './localdata';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { GroupRowComponent } from './GroupRowSelection/group-row-component/group-row.component';

@Component({
  selector: 'app-root',
  imports: [DxDataGridModule, DxLoadIndicatorModule, DxCheckBoxModule, GroupRowComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  dataSource: AspNetData.CustomStore;

  customersData: AspNetData.CustomStore;

  shippersData: AspNetData.CustomStore;

  @ViewChild(DxDataGridComponent) grid!: DxDataGridComponent;

  selectedRowKeys: any[] = [10521];

  selectionFilter: any[] = ['OrderID', '=', 10521];

  helper: GroupSelectionHelper | undefined;

  localData: any[];

  constructor() {
    const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
    this.localData = localData;
    this.dataSource = AspNetData.createStore({
      key: 'OrderID',
      loadUrl: `${url}/Orders`,
      onBeforeSend(_method: string, ajaxOptions: { xhrFields?: { withCredentials?: boolean } }) {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    });
    this.customersData = AspNetData.createStore({
      key: 'Value',
      loadUrl: `${url}/CustomersLookup`,
      onBeforeSend(_method: string, ajaxOptions: { xhrFields?: { withCredentials?: boolean } }) {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    });
    this.shippersData = AspNetData.createStore({
      key: 'Value',
      loadUrl: `${url}/ShippersLookup`,
      onBeforeSend(_method: string, ajaxOptions: { xhrFields?: { withCredentials?: boolean } }) {
        ajaxOptions.xhrFields = { withCredentials: true };
      },
    });
  }

  ngAfterViewInit(): void {
    this.helper = new GroupSelectionHelper(this.grid.instance);
  }

  groupRowInit(arg: IGroupRowReadyParameter): void {
    this.helper?.groupRowInit(arg);
  }
}
