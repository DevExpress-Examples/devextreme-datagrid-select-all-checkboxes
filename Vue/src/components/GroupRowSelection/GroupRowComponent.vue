<script setup lang="ts">
import DxLoadIndicator from 'devextreme-vue/load-indicator';
import DxCheckBox, { type DxCheckBoxTypes } from 'devextreme-vue/check-box';
import type { DxDataGridTypes } from 'devextreme-vue/data-grid';
import { onMounted, defineEmits } from 'vue';

const props = defineProps<{
  groupCellData: any,
  childRowKeys: any,
  // onInitialized: EventEmitter,
}>();

const emit = defineEmits(['initGroupRow']);

const iconSize = 18;

let isLoading = true;
let checked: boolean|undefined = false;
let childKeys: any[] = [];

onMounted(() => {
  // props.onInitialized.emit('event');
  emit("initGroupRow", [props.groupCellData.row.key, setCheckedState.bind(this)])
});

function checkBoxValueChanged(e: DxCheckBoxTypes.ValueChangedEvent) {
    checked = e.value;
    if (e.value) { 
      props.groupCellData.component.selectRows(props.childRowKeys ?? [], true);
    } else {
      props.groupCellData.component.deselectRows(props.childRowKeys ?? []);
    }
}

function setCheckedState(value:any){
  isLoading = false;
  checked = value;
}

</script>

<template>
  <div class="group-row-flex">
    <div class="group-selection-front">
      <dx-load-indicator :height="iconSize" :width="iconSize" :visible="isLoading"></dx-load-indicator>
      <dx-check-box v-if="!isLoading" :iconSize="iconSize" :value="checked" @onValueChanged="checkBoxValueChanged"></dx-check-box>
    </div>
    <!-- <span>{{ groupCellData | groupText }}</span> -->
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
