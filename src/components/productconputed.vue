<template>
  <div>
    <vxe-textarea
      v-model="state.inputText"
      placeholder="自适应文本高度"
      :autosize="{ minRows: 2 }"
      resize="vertical"
    ></vxe-textarea>

    <vxe-table
      :data="state.tableData"
      show-footer
      :footer-method="footerMethod"
    >
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
      footer: "",
    });

    watch(
      () => state.inputText,
      () => {
        requestPost(state.inputText);
      }
    );

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
        .post("http://wmxd.tgesh.top/Product/ProductCost", {
          Product: request_data,
        })
        .then((res) => {
          const data = res.data;
          if (data.StatusCode == 200) {
            state.tableData = data.List;
            state.footer = data.Sum;
          }
        });
    }

    function footerMethod() {
      return [["总成本", state.footer]];
    }

    return {
      state,
      footerMethod,
    };
  },
};
</script>

<style>
</style>