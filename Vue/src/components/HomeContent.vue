<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from 'vue';

import * as AspNetData from 'devextreme-aspnet-data-nojquery';

import "devextreme/dist/css/dx.material.blue.light.compact.css";
import DxDataGrid, { DxColumn, DxGroupPanel, DxGrouping, DxPaging, DxSelection, DxLookup, type DxDataGridTypes } from "devextreme-vue/data-grid";
import GroupSelectionHelper from "./GroupRowSelection/GroupRowSelectionHelper";
import GroupRowComponent from "./GroupRowSelection/GroupRowComponent.vue";
import type { IGroupRowReadyParameter } from "@/types";

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
const dataSource =  AspNetData.createStore({
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
  helper = new GroupSelectionHelper(dataGridRef.value!.instance)
})

function initGroupRow(arg: IGroupRowReadyParameter){
  helper.groupRowInit(arg);
}

</script>
<template>
  <div>
    <DxDataGrid
      ref="dataGridRef"
      :dataSource='dataSource'
      :remoteOperations='true'
      width="100%"
      height="604"
      :showBorders='true'
      :selectedRowKeys='selectedRowKeys'
    >
      <!-- <template #groupCellTemplate="{data, key}">
        <div>{{key}} {{ data }}</div>
        <GroupRowComponent :groupCellData="data" :childRowKey="helper.getChildRowKeys(data.component, data.key)" @onInitialized="groupRowInit"></GroupRowComponent>
      </template> -->
      <template #groupCellTemplate="{ data, component, key }">
            {{ ()=>{
              console.log(data, component, key);
            } }}
          <GroupRowComponent :groupCellData="data" :childRowKeys="helper.getChildRowKeys(component, data.key)" @initGroupRow="initGroupRow"></GroupRowComponent>
      </template>
      <DxSelection :deferred="false" mode="multiple"></DxSelection>
      <DxPaging :pageSize="12"></DxPaging>
      <DxGroupPanel :visible="true"></DxGroupPanel>
      <DxGrouping :autoExpandAll="false"></DxGrouping>
      <DxColumn
        dataField="CustomerID" caption="Customer">
        <DxLookup
          :dataSource="customersData"
          valueExpr="Value"
          displayExpr='Text'
        ></DxLookup>
      </DxColumn>
      <DxColumn dataField="OrderDate" dataType="date"></DxColumn>
      <DxColumn dataField="Freight"></DxColumn>
      <DxColumn dataField="ShipCountry" :groupIndex="0" group-cell-template="groupCellTemplate"></DxColumn>
      <DxColumn dataField="ShipCity" :groupIndex="2" group-cell-template="groupCellTemplate"></DxColumn>
      <DxColumn dataField="ShipVia" caption="Shipping Company" :groupIndex="1" dataType="number" group-cell-template="groupCellTemplate">
        <DxLookup
          :dataSource='shippersData'
          valueExpr="Value"
          displayExpr="Text"
        ></DxLookup>
      </DxColumn>
    </DxDataGrid>
  </div>
</template>
