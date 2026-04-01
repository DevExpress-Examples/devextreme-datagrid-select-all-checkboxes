import {
  Component, Input, Output, EventEmitter, AfterViewInit,
} from '@angular/core';
import type { DxCheckBoxTypes } from 'devextreme-angular/ui/check-box';
import type { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';

@Component({
  selector: 'group-row-selectable',
  templateUrl: './group-row.component.html',
  styleUrls: ['./group-row.component.css'],
  standalone: false,
})
export class GroupRowComponent implements AfterViewInit {
  @Input() groupCellData!: DxDataGridTypes.ColumnGroupCellTemplateData;

  @Input() childRowKeys: any[] | undefined = [];

  @Output() onInitialized = new EventEmitter<IGroupRowReadyParameter>();

  isLoading = true;

  checked: boolean | undefined = false;

  childKeys!: any[];

  iconSize = 18;

  constructor() {
    this.checkBoxValueChanged = this.checkBoxValueChanged.bind(this);
  }

  ngAfterViewInit(): void {
    this.onInitialized.emit({ key: this.groupCellData.row.key, component: this });
  }

  checkBoxValueChanged(e: DxCheckBoxTypes.ValueChangedEvent): void {
    this.checked = e.value;
    if (e.value) {
      this.groupCellData.component.selectRows(this.childRowKeys ?? [], true).catch(() => {});
    } else {
      this.groupCellData.component.deselectRows(this.childRowKeys ?? []).catch(() => {});
    }
  }

  public setCheckedState(value: boolean | undefined): void {
    this.checked = value;
    this.isLoading = false;
  }
}
export interface IGroupRowReadyParameter {
  key: string[];
  component: GroupRowComponent;
}
