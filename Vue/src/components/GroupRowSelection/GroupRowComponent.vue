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

let bindedLoading = ref(true);
let bindedCheck = ref(false);
let childKeys: any[] = [];

onMounted(() => {
  props.initGroupRow({
    key: props.groupCellData.row.key,
    setCheckedState: setCheckedState.bind(this)
  }).then((res:string[])=>{
    childKeys = res;
  });
});

const checkBoxValueChanged = (e: DxCheckBoxTypes.ValueChangedEvent) => {
  bindedCheck.value = e.value;
  if (e.value) {
    props.groupCellData.component.selectRows(childKeys ?? [], true);
  } else {
    props.groupCellData.component.deselectRows(childKeys ?? []);
  }
};

function setCheckedState(value:any) {
  bindedLoading.value = false;
  bindedCheck.value = value;
}

</script>

<template>
  <div class="group-row-flex">
    <div class="group-selection-front">
      <DxLoadIndicator
        :height="iconSize"
        :width="iconSize"
        :visible="bindedLoading"
      />
      <DxCheckBox
        v-if="!bindedLoading"
        :icon-size="iconSize"
        :value="bindedCheck"
        @valueChanged="checkBoxValueChanged"
      />
    </div>
    <span>{{ groupCellData.text }}</span>
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
