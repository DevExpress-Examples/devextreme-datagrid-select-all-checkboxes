import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { DxCheckBoxTypes } from 'devextreme-angular/ui/check-box';
import { DxDataGridTypes } from "devextreme-angular/ui/data-grid";

@Component({
  selector: 'group-row-selectable',
  templateUrl: './group-row.component.html',
  styleUrls: ['./group-row.component.css'],
})
export class GroupRowComponent implements AfterViewInit {
  @Input() groupCellData!: DxDataGridTypes.ColumnGroupCellTemplateData;
  @Input() childRowKeys: any[] | undefined = [];
  @Output() onInitialized = new EventEmitter<IGroupRowReadyParameter>();
  isLoading: boolean = true;
  checked: boolean | undefined = false;
  childKeys!: any[];
  iconSize: number = 18;
  constructor() {
    this.checkBoxValueChanged = this.checkBoxValueChanged.bind(this);
  }
  ngAfterViewInit() {
    this.onInitialized.emit({ key: this.groupCellData.row.key, component: this });
  }
  checkBoxValueChanged(e: DxCheckBoxTypes.ValueChangedEvent) {
    this.checked = e.value;
    if (e.value)
      this.groupCellData.component.selectRows(this.childRowKeys ?? [], true);
    else
      this.groupCellData.component.deselectRows(this.childRowKeys ?? []);
  }
  public setCheckedState(value: boolean | undefined) {
    this.checked = value;
    this.isLoading = false;
  }
}
export interface IGroupRowReadyParameter {
  key: string[];
  component: GroupRowComponent;
}