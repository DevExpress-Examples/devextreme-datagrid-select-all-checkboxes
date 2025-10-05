<script setup lang="ts">
import { ref, onMounted } from 'vue';

import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import {
  DxDataGrid,
  DxColumn,
  DxGrouping,
  DxPaging,
  DxGroupPanel,
  DxSelection,
  DxLookup,
} from 'devextreme-vue/data-grid';

import * as AspNetData from 'devextreme-aspnet-data-nojquery';

import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import GroupSelectionHelper from './GroupRowSelection/GroupRowSelectionHelper';
import GroupRowComponent from './GroupRowSelection/GroupRowComponent.vue';
import type { IGroupRowReadyParameter } from '@/types';

const url = 'https://js.devexpress.com/Demos/Mvc/api/DataGridWebApi';
const dataSource = AspNetData.createStore({
  key: 'OrderID',
  loadUrl: `${url}/Orders`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const customersData = AspNetData.createStore({
  key: 'Value',
  loadUrl: `${url}/CustomersLookup`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});
const shippersData = AspNetData.createStore({
  key: 'Value',
  loadUrl: `${url}/ShippersLookup`,
  onBeforeSend(_method, ajaxOptions) {
    ajaxOptions.xhrFields = { withCredentials: true };
  },
});

const dataGridRef = ref();
let helper: GroupSelectionHelper;

onMounted(() => {
  helper = new GroupSelectionHelper(dataGridRef.value!.instance);
});

function initGroupRow(arg: IGroupRowReadyParameter): Promise<any> {
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
    >
      <template #groupCellTemplate="{ data }">
        <GroupRowComponent
          :group-cell-data="data"
          :init-group-row="initGroupRow"
        />
      </template>
      <DxSelection
        :deferred="true"
        mode="multiple"
        :allow-select-all="true"
        show-check-boxes-mode="always"
      />
      <DxGroupPanel :visible="true"/>
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
        data-field="ShipVia"
        caption="Shipping Company"
        data-type="number"
        :group-index="1"
      >
        <DxLookup
          :data-source="shippersData"
          value-expr="Value"
          display-expr="Text"
        />
      </DxColumn>
      <DxColumn
        data-field="ShipCity"
        :group-index="2"
      />
    </DxDataGrid>
  </div>
</template>
