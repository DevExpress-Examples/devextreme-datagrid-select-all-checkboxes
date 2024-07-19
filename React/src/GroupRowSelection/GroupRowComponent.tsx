import { LoadIndicator } from "devextreme-react";
import "./GroupRowComponent.css";
import { DataGridTypes } from "devextreme-react/data-grid";
import { useCallback, useEffect, useRef, useState } from "react";
import CheckBox, { CheckBoxTypes } from "devextreme-react/check-box";
import GroupSelectionHelper from "./GroupRowSelectionHelper";

interface GroupRowProps {
  groupCellData: DataGridTypes.ColumnGroupCellTemplateData;
  childRowKeys?: any[];
  helper: GroupSelectionHelper;
  onInitialized: (param: IGroupRowReadyParameter) => void;
}

const iconSize = 18;

const GroupRowComponent: React.FC<GroupRowProps> = ({ groupCellData,
  // childRowKeys = [],
  helper,
  onInitialized }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [checked, setChecked] = useState<boolean|undefined>(false);
  const [childKeys, setChildKeys] = useState<any>([]);
  const componentRef = useRef<any>({}); 

  // const onValueChange = useCallback((value: any) => {
  //   // console.log("Change:", value);

  //   // console.log("checkBoxValueChanged", value, childRowKeys);
    
  //   if(value){
  //     groupCellData.component.selectRows(childRowKeys ?? [], true);
  //   } else {
  //     groupCellData.component.deselectRows(childRowKeys ?? []);
  //   }
  // }, [childRowKeys]);

  const onValueChange = useCallback((value: any) => {
    // console.log("Change:", value);

    // console.log("checkBoxValueChanged", value, childRowKeys);
    
    if(value){
      groupCellData.component.selectRows(childKeys ?? [], true);
    } else {
      groupCellData.component.deselectRows(childKeys ?? []);
    }
  }, [childKeys]);

  // const checkBoxValueChanged = useCallback((e:CheckBoxTypes.ValueChangedEvent)=>{
  //   setChecked(e.value);

  //   console.log("checkBoxValueChanged", e, childRowKeys);
    
  //   if(e.value){
  //     groupCellData.component.selectRows(childRowKeys ?? [], true);
  //   } else {
  //     groupCellData.component.deselectRows(childRowKeys ?? []);
  //   }
  // }, [childRowKeys, setChecked]);

  const setCheckedState = useCallback((value: boolean | undefined) => {
    setChecked(value);
    setIsLoading(false);
    // console.log("setCheckedState", groupCellData,checked,isLoading);
  }, []);

  useEffect(() => {
    // console.log(this);
    // console.log("default:", checked, childRowKeys);
    const arr = onInitialized({key: groupCellData.row.key, setCheckedState: setCheckedState.bind(this)});
    (arr as unknown as Promise<any>).then((children:any) => {
      console.log("Promise",children);
      setChildKeys(children);
    });
    // getChildRowKeys(group.component, group.row.key)
    // console.log(helper.getChildRowKeys(groupCellData.component, groupCellData.row.key));
    // setChildKeys(helper.getChildRowKeys(groupCellData.component, groupCellData.row.key));
    // console.log(childKeys);
    
  },[groupCellData, setCheckedState]);
  
  return (
    <div ref={componentRef} className="group-row-flex">
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
}

export default GroupRowComponent;

export interface IGroupRowReadyParameter {
  key: string[];
  setCheckedState: Function
}
