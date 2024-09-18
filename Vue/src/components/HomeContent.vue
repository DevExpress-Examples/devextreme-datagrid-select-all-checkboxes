<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from 'vue';

import * as AspNetData from 'devextreme-aspnet-data-nojquery';

import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import DxDataGrid, { DxColumn, DxGroupPanel, DxGrouping, DxPaging, DxSelection, DxLookup } from 'devextreme-vue/data-grid';
import GroupSelectionHelper from './GroupRowSelection/GroupRowSelectionHelper';
import GroupRowComponent from './GroupRowSelection/GroupRowComponent.vue';
import type { IGroupRowReadyParameter } from '@/types';

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
const dataSource = AspNetData.createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  onBeforeSend(method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const customersData = AspNetData.createStore({
  key: 'Value',
  loadUrl: `${url}/CustomersLookup`,
  onBeforeSend(method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const shippersData = AspNetData.createStore({
  key: 'Value',
  loadUrl: `${url}/ShippersLookup`,
  onBeforeSend(method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const dataGridRef = ref();
let helper:GroupSelectionHelper;
let selectedRowKeys: any[] = [10521];

onMounted(() => {
  helper = new GroupSelectionHelper(dataGridRef.value!.instance);
});

function initGroupRow(arg: IGroupRowReadyParameter) {
  return helper.groupRowInit(arg);
}

</script>
<template>
  <div>
    <DxDataGrid
      id="gridContainer"
      ref="dataGridRef"
      :data-source="dataSource"
      :remote-operations="true"
      width="100%"
      height="604"
      :show-borders="true"
      :selected-row-keys="selectedRowKeys"
    >
      <template #groupCellTemplate="{ data }">
        <GroupRowComponent
          :group-cell-data="data"
          :init-group-row="initGroupRow"
        />
      </template>
      <DxSelection
        :deferred="false"
        mode="multiple"
      />
      <DxPaging :page-size="12"/>
      <DxGrouping :auto-expand-all="false"/>
      <DxColumn
        data-field="CustomerID"
        caption="Customer"
      >
        <DxLookup
          :data-source="customersData"
          value-expr="Value"
          display-expr="Text"
        />
      </DxColumn>
      <DxColumn
        data-field="OrderDate"
        data-type="date"
      />
      <DxColumn data-field="Freight"/>
      <DxColumn
        data-field="ShipCountry"
        :group-index="0"
      />
      <DxColumn
        data-field="ShipCity"
        :group-index="2"
      />
      <DxColumn
        data-field="ShipVia"
        caption="Shipping Company"
        :group-index="1"
        data-type="number"
      >
        <DxLookup
          :data-source="shippersData"
          value-expr="Value"
          display-expr="Text"
        />
      </DxColumn>
    </DxDataGrid>
  </div>
</template>
