<script setup lang="ts">
import DxLoadIndicator from 'devextreme-vue/load-indicator';
import DxCheckBox, { type DxCheckBoxTypes } from 'devextreme-vue/check-box';
import { onMounted, ref } from 'vue';
import type { ColumnGroupCellTemplateData } from 'devextreme/ui/data_grid';

const props = defineProps<{
  groupCellData: ColumnGroupCellTemplateData,
  initGroupRow: Function,
}>();

const iconSize = 18;

let boundLoading = ref(true);
let boundCheck = ref<boolean | undefined>(false);
let childKeys: any[] = [];

onMounted(() => {
  props.initGroupRow({
    key: props.groupCellData.row.key,
    setCheckedState: (value: boolean | undefined) => {
      boundLoading.value = false;
      boundCheck.value = value;
    }
  }).then((res:string[])=>{
    childKeys = res;
  });
});

const checkBoxValueChanged = (e: DxCheckBoxTypes.ValueChangedEvent) => {
  boundCheck.value = e.value;
  if (e.value) {
    props.groupCellData.component.selectRows(childKeys ?? [], true);
  } else {
    props.groupCellData.component.deselectRows(childKeys ?? []);
  }
};


function groupText():string{
  let text = `${props.groupCellData.column.caption}: ${props.groupCellData.displayValue}`;
  if (props.groupCellData.groupContinuedMessage) text += ` (${props.groupCellData.groupContinuedMessage})`;
  if (props.groupCellData.groupContinuesMessage) text += ` (${props.groupCellData.groupContinuesMessage})`;
  return text;
}
</script>

<template>
  <div class="group-row-flex">
    <div class="group-selection-front">
      <DxLoadIndicator
        :height="iconSize"
        :width="iconSize"
        :visible="boundLoading"
      />
      <DxCheckBox
        v-if="!boundLoading"
        :icon-size="iconSize"
        :value="boundCheck"
        @valueChanged="checkBoxValueChanged"
      />
    </div>
    <span>{{ groupText() }}</span>
  </div>
</template>

<style scoped>
.group-selection-front {
  margin-right: 10px;
}
.group-selection-front .dx-loadindicator {
  display: block;
}
.group-row-flex {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
