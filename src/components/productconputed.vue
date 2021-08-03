<template>
  <div>
    <vxe-textarea
      v-model="state.inputText"
      resize="none"
      @blur="blur"
      @focus="focus"
    ></vxe-textarea>
    <div>总成本:{{ state.footer }}</div>
    <vxe-button
      type="text"
      status="primary"
      content="修改成本"
      @click="changeCost"
    ></vxe-button>
    <vxe-table :data="state.tableData" siz="mini" height="400" border resizable>
      <vxe-table-column
        field="Name"
        title="商品名称"
        sortable
      ></vxe-table-column>
      <vxe-table-column
        field="Quantity"
        title="求和项:销量"
        sortable
      ></vxe-table-column>
      <vxe-table-column field="Cost" title="成本" sortable></vxe-table-column>
      <vxe-table-column
        field="AllCost"
        title="总成本"
        sortable
      ></vxe-table-column>
    </vxe-table>

    <vxe-modal
      v-model="state.showCost"
      id="myModal6"
      width="800"
      height="400"
      min-width="460"
      min-height="320"
      show-zoom
      resize
      remember
      storage
      transfer
    >
      <template #title>
        <span>修改成本</span>
      </template>
      <template #default>
        <vxe-table
          border
          resizable
          show-overflow
          keep-source
          ref="xTable"
          height="auto"
          auto-resize
          :data="state.CostData"
          :menu-config="state.tableMenu"
          :edit-config="{ trigger: 'click', mode: 'row', showStatus: true }"
          @menu-click="contextMenuClickEvent"
        >
          <vxe-table-column
            field="ProductName"
            title="商品名称"
            :edit-render="{ name: 'input', attrs: { type: 'text' } }"
            sortable
          ></vxe-table-column>

          <vxe-table-column
            field="Cost"
            title="成本"
            :edit-render="{
              name: '$input',
              props: { type: 'float', digits: 4 },
            }"
            sortable
          ></vxe-table-column>
        </vxe-table>
      </template>
    </vxe-modal>
  </div>
</template>

<script>
import { reactive, ref } from "@vue/reactivity";
import { computed, watch } from "@vue/runtime-core";
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  setup() {
    const state = reactive({
      inputText: "",
      tableData: [],
      CostData: [],
      catchDate: {},
      footer: "",
      showCost: false,
      tableMenu: {
        body: {
          options: [
            [
              { code: "reload", name: "刷新", disabled: false },
              { code: "insertAt", name: "插入", disabled: false },
              { code: "remove", name: "删除", disabled: false },
              {
                code: "save",
                name: "保存",
                prefixIcon: "fa fa-save",
                disabled: false,
              },
            ],
          ],
        },
      },
    });

    const xTable = ref(null);

    function requestPost(inputText) {
      let request_data = [];
      const tableData = inputText.split("\n");
      tableData.forEach((element) => {
        const field = element.split("\t");
        request_data.push({
          Name: field[0],
          Quantity: field[1],
        });
      });
      axios
        .post(" http://192.168.0.102:5001/Product/ProductCost", {
          Product: request_data,
        })
        .then((res) => {
          const data = res.data;
          if (data.StatusCode == 200) {
            let constdata = [];
            request_data.forEach((element) => {
              const ind = data.List.findIndex((val) => {
                if (element.Name == val.Name) {
                  return true;
                }
              });
              if (ind != -1) {
                constdata.push(data.List[ind]);
              } else {
                if (element.Name != "") {
                  constdata.push({
                    ...element,
                    Cost: "",
                    AllCost: "",
                  });

                  if (!state.catchDate[element.Name]) {
                    state.catchDate[element.Name] = 0;
                  }
                }
              }
            });
            state.tableData = constdata;
            state.footer = data.Sum;
          }
        });

      //axios.get("http://xi29js.natappfree.cc/Count");
    }

    function blur() {
      requestPost(state.inputText);
    }

    function focus() {
      state.inputText = "";
    }

    function changeCost() {
      state.showCost = true;
      getCost();
    }

    function getCost() {
      axios.get(" http://192.168.0.102:5001/Product/Cost").then((res) => {
        const data = res.data;
        if (data.StatusCode == 200) {
          state.CostData = data.List;
        }

        for (const iterator in state.catchDate) {
          insertEvent({
            ProductName: iterator,
            Cost: state.catchDate[iterator],
          });
        }
      });
    }

    function contextMenuClickEvent({ menu, row, column }) {
      const $table = xTable.value;
      switch (menu.code) {
        case "reload":
          getCost();
          break;
        case "insertAt":
          insertEvent(row, column);
          break;
        case "remove":
          $table.remove(row);
          break;
        case "save":
          save();
          break;
      }
    }

    function save() {
      const { insertRecords, removeRecords, updateRecords } =
        xTable.value.getRecordset();

      let saveData = [];

      if (insertRecords.length > 0) {
        insertRecords.forEach((element) => {
          saveData.push({
            OrderType: 1,
            ...element,
          });
        });
      }

      if (updateRecords.length > 0) {
        updateRecords.forEach((element) => {
          saveData.push({
            OrderType: 2,
            ...element,
          });
        });
      }
      if (removeRecords.length > 0) {
        removeRecords.forEach((element) => {
          saveData.push({
            OrderType: 3,
            ...element,
          });
        });
      }

      if (saveData.length > 0) {
        console.log(saveData);
        // axios
        //   .post(" http://192.168.0.102:5001/Product/Cost", {
        //     CostLists: saveData,
        //   })
        //   .then((res) => {
        //     if (res.data.StatusCode == 200) {
        //       ElMessage.success("保存成功");
        //       getCost();
        //     } else {
        //       ElMessage.error("保存失败", res.data.Message);
        //     }
        //   });
      }
    }

    function insertEvent(row, column, item = null) {
      const $table = xTable.value;
      $table.insertAt(null, row || -1).then(({ row1 }) => {
        console.log(row1);
        $table.setActiveCell(row1, column || "ProductName");
      });
    }

    return {
      state,
      blur,
      focus,
      changeCost,
      xTable,
      contextMenuClickEvent,
    };
  },
};
</script>

<style>
</style>