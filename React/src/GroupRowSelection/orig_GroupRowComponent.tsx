import { LoadIndicator } from 'devextreme-react';
import './GroupRowComponent.css';
import { type DataGridTypes } from 'devextreme-react/data-grid';
import { useCallback, useEffect, useState } from 'react';
import CheckBox from 'devextreme-react/check-box';
import type { ValueChangedEvent } from 'devextreme/ui/check_box';

interface GroupRowProps {
  groupCellData: DataGridTypes.ColumnGroupCellTemplateData;
  childRowKeys?: any[];
  // eslint-disable-next-line no-unused-vars
  onInitialized: (param: IGroupRowReadyParameter) => void;
}

const iconSize = 18;

// eslint-disable-next-line func-style
const GroupRowComponent: React.FC<GroupRowProps> = ({
  groupCellData,
  onInitialized,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [checked, setChecked] = useState<boolean | undefined>(false);
  const [childKeys, setChildKeys] = useState<any>([]);

  // eslint-disable-next-line func-style
  const groupText = (): string => {
    let text = `${groupCellData.column.caption}: ${groupCellData.displayValue}`;
    if (groupCellData.groupContinuedMessage) text += ` (${groupCellData.groupContinuedMessage})`;
    if (groupCellData.groupContinuesMessage) text += ` (${groupCellData.groupContinuesMessage})`;
    return text;
  };

  const onValueChange = useCallback((value: ValueChangedEvent) => {
    if (value) {
      // eslint-disable-next-line no-console
      groupCellData.component.selectRows(childKeys ?? [], true).catch(console.error);
    } else {
      // eslint-disable-next-line no-console
      groupCellData.component.deselectRows(childKeys ?? []).catch(console.error);
    }
  }, [childKeys, groupCellData]);

  const setCheckedState = useCallback((value: boolean | undefined) => {
    setChecked(value);
    setIsLoading(false);
  }, [setChecked, setIsLoading]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-invalid-this
    const arr = onInitialized({ key: groupCellData.row.key, setCheckedState: setCheckedState.bind(this) });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (arr as unknown as Promise<any>).then((children: any) => {
      setChildKeys(children);
    });
  }, [groupCellData, setCheckedState, setChildKeys]);

  return (
    <div className="group-row-flex">
      <div className="group-selection-front">
        <LoadIndicator
          height={iconSize}
          width={iconSize}
          visible={isLoading}></LoadIndicator>
        <CheckBox
          visible={!isLoading}
          iconSize={iconSize}
          value={checked}
          onValueChanged={onValueChange}
        ></CheckBox>
      </div>
      <span>{groupText()}</span>
    </div>
  );
};

export default GroupRowComponent;

export interface IGroupRowReadyParameter {
  key: string[];
  setCheckedState: Function;
}
