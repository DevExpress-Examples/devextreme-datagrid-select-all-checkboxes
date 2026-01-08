import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useGroupRowSelection } from "./selection-context/row-selection-context";
import CheckBox, { type CheckBoxTypes } from "devextreme-react/check-box";
import { LoadIndicator } from "devextreme-react";
import { type DataGridTypes } from "devextreme-react/data-grid";
import "./GroupRowComponent.css";

interface GroupRowProps {
  groupCellData: DataGridTypes.ColumnGroupCellTemplateData;
  onInitialized: (param: IGroupRowReadyParameter) => Promise<any> | undefined;
}

export interface IGroupRowReadyParameter {
  key: any[];
}

const iconSize = 18;

const GroupRowComponent: React.FC<GroupRowProps> = ({
  groupCellData,
  onInitialized,
}) => {
  const [childKeys, setChildKeys] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const actionInProgressRef = React.useRef(false);

  const {
    selectedRows,
    isGroupLoading,
    hasAnyLoading,
    handleGroupSelection,
    setGroupLoading,
  } = useGroupRowSelection();

  const { component: gridInstance, row } = groupCellData;

  const isLoading = isGroupLoading(row.key);

  const checkedValue = useMemo(() => {
    if (!childKeys.length) return false;

    const allSelected = childKeys.every((key) => selectedRows.has(key));
    const noneSelected = childKeys.every((key) => !selectedRows.has(key));

    if (allSelected) return true;
    if (noneSelected) return false;
    return undefined;
  }, [selectedRows, childKeys]);

  const onValueChanged = useCallback(
    (e: CheckBoxTypes.ValueChangedEvent) => {
      if (!e.event) return;
      if (actionInProgressRef.current) return;
      actionInProgressRef.current = true;

      const action = e.value ? "select" : "deselect";
      handleGroupSelection(row.key, childKeys, action, gridInstance).finally(
        () => {
          actionInProgressRef.current = false;
        }
      );
    },
    [
      childKeys,
      gridInstance,
      handleGroupSelection,
      hasAnyLoading,
      isLoading,
      row.key,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    setIsInitializing(true);

    const promise = onInitialized({ key: row.key });

    promise
      ?.then((keys: any[]) => {
        if (isMounted) {
          setChildKeys(keys);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
      setGroupLoading(row.key, false);
    };
  }, [row.key, onInitialized, setGroupLoading]);

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const groupText = useMemo((): string => {
    const {
      column,
      displayValue,
      groupContinuedMessage,
      groupContinuesMessage,
    } = groupCellData;
    let text = `${column.caption}: ${displayValue}`;
    if (groupContinuedMessage) text += ` (${groupContinuedMessage})`;
    if (groupContinuesMessage) text += ` (${groupContinuesMessage})`;
    return text;
  }, [groupCellData]);

  const isLocked = isInitializing || (!isLoading && hasAnyLoading);

  return (
    <div
      className="group-row-flex"
      style={{ display: "flex", alignItems: "center" }}
    >
      <div
        className="group-selection-front"
        onClick={stopPropagation}
        style={{ marginRight: "10px", width: iconSize, height: iconSize }}
      >
        {isLocked ? (
          <LoadIndicator height={iconSize} width={iconSize} />
        ) : (
          <CheckBox
            value={checkedValue}
            onValueChanged={onValueChanged}
            iconSize={iconSize}
            disabled={isLocked}
          />
        )}
      </div>
      <span style={{ opacity: isLocked ? 0.5 : 1 }}>{groupText}</span>
    </div>
  );
};

export default React.memo(GroupRowComponent);
