<script setup lang="ts">
import {ref} from "vue"
import {getAllOrder} from "../../api/order.ts"
import OrderItem from "../../components/OrderItem.vue"

const role = sessionStorage.getItem("role")

const orderList = ref()

getAllOrder().then(res => {
  orderList.value = res.data.result
})
</script>


<template>
  <el-main>
    <div class="order-item-list">
      <OrderItem
          v-for="orderVO in orderList" :orderId="orderVO.id"/>
    </div>
  </el-main>
</template>


<style scoped>
.order-item-list {
  display: flex;
  padding: 2px;
  flex-flow: wrap;
  justify-content: center;
}
</style>
