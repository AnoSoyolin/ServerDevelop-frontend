<script setup lang="ts">
import {Ref, ref} from "vue"
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
const roleStoreId = Number(sessionStorage.getItem("storeId"))
const role=sessionStorage.getItem("role")
const receivedUserId: Ref<number[]> = ref([])
getCouponDetail()
const checkDialogVisible=ref(false)
function closeCheckDialog() {
  checkDialogVisible.value = false;
}
function openCheckDialog() {
  checkDialogVisible.value = true;
}
function getCouponDetail() {
  getGroupByGroupId(props.groupId).then(res => {
    amount.value = res.data.result.amount
    type.value = res.data.result.type
    storeId.value = res.data.result.storeId
    full.value = res.data.result.full
    reduction.value = res.data.result.reduction
    receivedUserId.value=res.data.result.userId
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
  if (amount.value<=0){
    ElMessage({
      message: "优惠券已领完",
      type: 'error',
      center: true,
    })
    return
  }
  if (receivedUserId.value.includes(userId)){
    ElMessage({
      message: "已领过该优惠券",
      type: 'error',
      center: true,
    })
    return
  }
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
      console.log(res.data)
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
  <el-card v-if="role==='MANAGER'||storeId===roleStoreId||storeId===0" class="coupon-item-card" shadow="hover">
    <el-descriptions :column="1">
      <el-descriptions-item v-if="type!='SPECIAL'" style="font-size: 15px" label="优惠券类别:">
        <el-tooltip placement="top">
          <template #content> 0-100元区间打九五折；<br>
            100-200元区间打九折；<br>
            200-300元区间打八五折；<br>
            300-400元区间打八折；<br>
            400-500元区间打七五折；<br>
            500元以上区间打七折。 </template>
          <el-button class="no-border-button">蓝鲸券 </el-button>
        </el-tooltip>
      </el-descriptions-item>
      <el-descriptions-item v-if="type!='FULL_REDUCTION'" style="font-size: 15px" label="优惠券类别:">
        满减券
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
    <el-button v-if="role==='CUSTOMER'" @click="handleReceive" class="receive-button" size="small" type="primary">
      领取
    </el-button>
    <el-button v-if="role!='CUSTOMER'" @click="openCheckDialog" type="primary" class="button" plain>
      查看领取者
    </el-button>
    <el-dialog
        v-model="checkDialogVisible"
        title="领取者:"
        width="400px"
        @close="closeCheckDialog">

      <el-text>
        <el-form-item v-for="userId in receivedUserId" key= userId >
          {{userId}}
        </el-form-item>
      </el-text>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeCheckDialog">确定</el-button>
      </div>
    </el-dialog>
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
.no-border-button {
  border: none;
  width: 55px;
}
</style>