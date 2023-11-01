import { Pipe, PipeTransform } from '@angular/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
  
@Pipe({
    name: 'groupText'
})
export class GroupTextPipe implements PipeTransform {
  transform(value: DxDataGridTypes.ColumnGroupCellTemplateData): string {
    let text = `${value.column.caption}: ${value.displayValue}`;
    if (value.groupContinuedMessage) text += ` (${value.groupContinuedMessage})`;
    if (value.groupContinuesMessage) text += ` (${value.groupContinuesMessage})`;
    return text;
  }
}