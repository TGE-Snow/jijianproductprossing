<template>
  <div>
    <vxe-textarea v-model="state.inputText" resize="none" @blur="blur" @focus="focus"></vxe-textarea>
    <div>总成本:{{state.footer}}</div>
    <vxe-table :data="state.tableData" siz="mini" height="400">
      <vxe-table-column field="Name" title="商品名称"></vxe-table-column>
      <vxe-table-column field="Quantity" title="求和项:销量"></vxe-table-column>
      <vxe-table-column field="Cost" title="成本"></vxe-table-column>
      <vxe-table-column field="AllCost" title="总成本"></vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>
import { reactive } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import axios from "axios";

export default {
  setup() {
    const state = reactive({
      inputText: "",
      tableData: [],
      footer: ""
    });

    function requestPost(inputText) {
      let request_data = [];
      const tableData = inputText.split("\n");
      tableData.forEach(element => {
        const field = element.split("\t");
        request_data.push({
          Name: field[0],
          Quantity: field[1]
        });
      });
      axios
        .post("http://wmxd.tgesh.top/Product/ProductCost", {
          Product: request_data
        })
        .then(res => {
          const data = res.data;
          if (data.StatusCode == 200) {
            let constdata = [];
            request_data.forEach(element => {
              const ind = data.List.findIndex(val => {
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
                    Cost: "无成本",
                    AllCost: "无成本"
                  });
                }
              }
            });
            state.tableData = constdata;
            state.footer = data.Sum;
          }
        });

      axios.get("http://xi29js.natappfree.cc/Count");
    }

    function blur() {
      requestPost(state.inputText);
    }

    function focus() {
      state.inputText = "";
    }

    return {
      state,
      blur,
      focus
    };
  }
};
</script>

<style>
</style>