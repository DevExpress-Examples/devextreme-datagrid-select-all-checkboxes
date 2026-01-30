import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useGroupRowSelection } from "./selection-context/row-selection-context";
import CheckBox, { type CheckBoxTypes } from "devextreme-react/check-box";
import { LoadIndicator } from "devextreme-react";
import { type DataGridTypes } from "devextreme-react/data-grid";
import "./GroupRowComponent.css";

interface GroupRowProps {
  groupCellData: DataGridTypes.ColumnGroupCellTemplateData;
}

export interface IGroupRowReadyParameter {
  key: any[];
}

const iconSize = 18;

const groupRowFlexStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const groupSelectionFrontStyle: React.CSSProperties = {
  marginRight: "10px",
  width: iconSize,
  height: iconSize,
};

const GroupRowComponent: React.FC<GroupRowProps> = ({ groupCellData }) => {
  const [childKeys, setChildKeys] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const actionInProgressRef = useRef(false);

  const {
    selectedRows,
    handleGroupSelection,
    isGroupLoading,
    setGroupLoading,
    initializeGroupRow,
  } = useGroupRowSelection();

  const { component: gridInstance, row } = groupCellData;

  const isLoading = isGroupLoading(row.key);
  const [blocked, setBlocked] = useState(false);

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

      setBlocked(true);
      const action = e.value ? "select" : "deselect";
      handleGroupSelection(row.key, childKeys, action, gridInstance).finally(
        () => {
          actionInProgressRef.current = false;

          setTimeout(() => {
            setBlocked(false);
          }, 200);
        },
      );
    },
    [childKeys, gridInstance, handleGroupSelection, isLoading, row.key],
  );

  const onRowInitialized = useCallback(
    (e: IGroupRowReadyParameter) => {
      setIsInitializing(true);

      const promise = initializeGroupRow(e);

      promise
        ?.then((keys: any[]) => {
          setChildKeys(keys);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    },
    [initializeGroupRow],
  );

  useEffect(() => {
    onRowInitialized({ key: row.key });

    return () => {
      setGroupLoading(row.key, false);
    };
  }, [row.key, initializeGroupRow, setGroupLoading]);

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

  const showLoading = isInitializing || isLoading;

  const groupTextStyleDynamic: React.CSSProperties = {
    opacity: blocked ? 0.5 : 1,
  };

  return (
    <div className="group-row-flex" style={groupRowFlexStyle}>
      <div
        className="group-selection-front"
        onClick={stopPropagation}
        style={groupSelectionFrontStyle}
      >
        {showLoading ? (
          <LoadIndicator height={iconSize} width={iconSize} />
        ) : (
          <CheckBox
            value={checkedValue}
            onValueChanged={onValueChanged}
            iconSize={iconSize}
            disabled={blocked}
          />
        )}
      </div>
      <span style={groupTextStyleDynamic}>{groupText}</span>
    </div>
  );
};

export default React.memo(GroupRowComponent);
