import { LoadIndicator } from "devextreme-react";
import "./GroupRowComponent.css";
import { type DataGridTypes } from "devextreme-react/data-grid";
import { useEffect, useMemo, useRef, useState } from "react";
import CheckBox from "devextreme-react/check-box";
import type { CheckBoxTypes } from "devextreme-react/check-box";
import { useEventCallback } from "../hooks";

interface GroupRowProps {
  groupCellData: DataGridTypes.ColumnGroupCellTemplateData;
  childRowKeys?: any[];
  // eslint-disable-next-line no-unused-vars
  onInitialized: (param: IGroupRowReadyParameter) => Promise<any> | undefined;
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
  const skipCheckBoxValueHandling = useRef(false);

  // Memoize the group text to avoid recalculating on every render
  const groupText = useMemo((): string => {
    let text = `${groupCellData.column.caption}: ${groupCellData.displayValue}`;
    if (groupCellData.groupContinuedMessage)
      text += ` (${groupCellData.groupContinuedMessage})`;
    if (groupCellData.groupContinuesMessage)
      text += ` (${groupCellData.groupContinuesMessage})`;
    return text;
  }, [
    groupCellData.column.caption,
    groupCellData.displayValue,
    groupCellData.groupContinuedMessage,
    groupCellData.groupContinuesMessage,
  ]);

  const onValueChange = useEventCallback(
    (value: CheckBoxTypes.ValueChangedEvent) => {
      if (skipCheckBoxValueHandling.current) {
        return;
      }

      if (value.value) {
        // eslint-disable-next-line no-console
        groupCellData.component
          .selectRows(childKeys ?? [], true)
          .catch(console.error);
      } else {
        // eslint-disable-next-line no-console
        groupCellData.component
          .deselectRows(childKeys ?? [])
          .catch(console.error);
      }
    }
  );

  const setCheckedState = useEventCallback((value: boolean | undefined) => {
    setChecked(value);
    setIsLoading(false);
    setTimeout(() => {
      skipCheckBoxValueHandling.current = false;
    }, 0);
  });

  const groupRowKey = useMemo(
    () => JSON.stringify(groupCellData.row.key),
    [groupCellData.row.key]
  );

  useEffect(() => {
    skipCheckBoxValueHandling.current = true;
    // eslint-disable-next-line @typescript-eslint/no-invalid-this
    const action = onInitialized?.({
      key: groupCellData.row.key,
      setCheckedState: setCheckedState.bind(this),
    });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    action?.then((children: any) => {
      setChildKeys(children);
    });
  }, [groupRowKey]);

  return (
    <div
      className="group-row-flex"
      id={`custom-group-row-${groupRowKey}`}
      data-child-keys={JSON.stringify(childKeys)}
    >
      <div className="group-selection-front">
        <LoadIndicator
          height={iconSize}
          width={iconSize}
          visible={isLoading}
        ></LoadIndicator>
        <CheckBox
          visible={!isLoading}
          iconSize={iconSize}
          value={checked}
          onValueChanged={onValueChange}
        ></CheckBox>
      </div>
      <span>{groupText}</span>
    </div>
  );
};

export default GroupRowComponent;

export interface IGroupRowReadyParameter {
  key: string[];
  setCheckedState: Function;
}
