<script setup lang="ts">
import {ref} from "vue"
import {getAllGroup} from "../../api/coupon.ts"
import CouponItem from "../../components/CouponItem.vue"

const role = sessionStorage.getItem("role")

const couponList = ref()

getAllGroup().then(res => {
  couponList.value = res.data.result
})
</script>


<template>
  <el-main>
    <div class="coupon-item-list">
      <CouponItem
          v-for="couponVO in couponList" :couponId="couponVO.id"/>
    </div>
  </el-main>
</template>


<style scoped>
.coupon-item-list {
  display: flex;
  padding: 2px;
  flex-flow: wrap;
  justify-content: center;
}
</style>
