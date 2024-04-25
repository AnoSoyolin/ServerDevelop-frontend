<script setup lang="ts">
import {ref} from "vue"
import {getGroupByGroupId, receiveCoupon} from "../api/coupon.ts";
import {getStoreById} from "../api/store.ts";

const props = defineProps({
  groupId: {
    type: Number,
    required: true
  }
})

//订单详细信息
const amount = ref(0)
const type = ref('')
const storeId = ref(0)
const full = ref(0)
const reduction = ref(0)
const storeName = ref('')
const userId = Number(sessionStorage.getItem("userId"))
getCouponDetail()
console.log(props.groupId)
function getCouponDetail() {
  getGroupByGroupId(props.groupId).then(res => {
    console.log(props.groupId)
    amount.value = res.data.result.amount
    type.value = res.data.result.type
    storeId.value = res.data.result.storeId
    full.value = res.data.result.full
    reduction.value = res.data.result.reduction
    if (storeId.value === 0) {
      storeName.value = "所有商店"
    } else {
      getStoreById(storeId.value).then(res => {
        storeName.value = res.data.result.name
      })
    }
  })
}

function handleReceive() {
  console.log("dnwoiendw")
  const couponInfo = {
    userId:userId,
    type: type.value,
    storeId: storeId.value,
    full: full.value,
    groupId: props.groupId,
    reduction: reduction.value,
  }
  receiveCoupon(couponInfo).then(res => {
    if (res.data.code === '000') {
      ElMessage({
        message: '优惠券领取成功！',
        type: 'success',
        center: true,
      })
      getCouponDetail()
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
}

</script>


<template>
  <el-card class="coupon-item-card" shadow="hover">
    <el-descriptions :column="1">
    <el-descriptions-item style="font-size: 15px" label="优惠券类别:">
      {{ type }}
    </el-descriptions-item>
    <el-descriptions-item v-if="type!='SPECIAL'" style="font-size: 15px" label="优惠券详情:">
      满{{ full }}元减{{ reduction }}元
    </el-descriptions-item>
    <el-descriptions-item style="font-size: 15px" label="可用商店：">
      {{ storeName }}
    </el-descriptions-item>
    <el-descriptions-item style="font-size: 15px" label="剩余数量：">
      {{ amount }}
    </el-descriptions-item>
      <el-descriptions-item v-if="type==='SPECIAL'">
        <br>
      </el-descriptions-item>
    </el-descriptions>
    <el-button @click="handleReceive" class="receive-button" size="small" type="primary">
      领取
    </el-button>
  </el-card>

</template>


<style scoped>
.order-item-card {
  margin: 20px;
  border-radius: 8px;
  min-width: max-content;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-change-button {
  margin-left: 10px;
}
</style>