import { LoadIndicator } from 'devextreme-react';
import './GroupRowComponent.css';
import { DataGridTypes } from 'devextreme-react/data-grid';
import { useCallback, useEffect, useState } from 'react';
import CheckBox from 'devextreme-react/check-box';

interface GroupRowProps {
  groupCellData: DataGridTypes.ColumnGroupCellTemplateData;
  childRowKeys?: any[];
  onInitialized: (param: IGroupRowReadyParameter) => void;
}

const iconSize = 18;

const GroupRowComponent: React.FC<GroupRowProps> = ({
  groupCellData,
  onInitialized,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [checked, setChecked] = useState<boolean | undefined>(false);
  const [childKeys, setChildKeys] = useState<any>([]);

  const onValueChange = useCallback((value: boolean | null) => {
    if (value) {
      groupCellData.component.selectRows(childKeys ?? [], true);
    } else {
      groupCellData.component.deselectRows(childKeys ?? []);
    }
  }, [childKeys, groupCellData]);

  const setCheckedState = useCallback((value: boolean | undefined) => {
    setChecked(value);
    setIsLoading(false);
  }, [setChecked, setIsLoading]);

  useEffect(() => {
    const arr = onInitialized({ key: groupCellData.row.key, setCheckedState: setCheckedState.bind(this) });
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
          onValueChange={onValueChange}
        ></CheckBox>
      </div>
      <span>{groupCellData.text}</span>
    </div>
  );
};

export default GroupRowComponent;

export interface IGroupRowReadyParameter {
  key: string[];
  setCheckedState: Function;
}
