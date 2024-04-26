<script setup lang="ts">
import {ref} from "vue"
import {getOrderById, payOrder,getPrice} from "../api/order.ts"
import {getAvailableCoupons} from "../api/coupon.ts";
import {parseOrderType} from "../utils"

const saveOrderId = ref(0)
const orderDialogVisible = ref(false)

const emit = defineEmits(['operationFinish'])

//通过父组件传来的orderId获取订单详情
function open(orderId: number) {
  //存储当前订单orderId
  saveOrderId.value = orderId
  getOrderDetail(orderId)
  orderDialogVisible.value = true
}

defineExpose({
  open
})

interface coupon {
  id:number,
  storeId:number,
  userId:number,
  couponGroupId:number,
  type:string,
  full:number,
  reduction:number,
  used:boolean
}

const amount = ref(0)
const price = ref(0)
const type = ref('')
const totalPrice = ref(0)
const realPrice = ref(0)
const coupons = ref<coupon[]>([])
const userId = (Number)(sessionStorage.getItem("userId"))
const couponId = ref(0)


function getOrderDetail(orderId: number) {
  getOrderById(orderId).then(res => {
    amount.value = res.data.result.amount
    type.value = res.data.result.type
    price.value = res.data.result.price
    //根据商品单价和购买数量计算总价
    totalPrice.value = price.value * amount.value
    getRealPrice(0);
    getAllCoupon();
  })
}

function handleConfirmOrder() {
  payOrder(saveOrderId.value,couponId.value).then(res => {
    if (res.data.code === '000') {
      ElMessage({
        message: '订单支付成功！',
        type: 'success',
        center: true,
      })
      //在本项目中，传回的参数没有实际作用
      emit("operationFinish", true)
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
      //在本项目中，传回的参数没有实际作用
      emit("operationFinish", false)
    }
    orderDialogVisible.value = false
  })
}

function getAllCoupon() {
  getAvailableCoupons(userId,saveOrderId.value).then(res => {
    coupons.value = res.data.result
  })
}

function getRealPrice(couponId: number) {
  getPrice(saveOrderId.value,couponId).then(res => {
    realPrice.value = res.data.result
  })
}

</script>


<template>
  <el-dialog v-model="orderDialogVisible">
    <el-row>
      <span class="pay-dialog-title">订单支付</span>
    </el-row>

    <div>
      <el-form>
        <el-form-item>
          <label for="amount">购买数量：</label>
          {{ amount }} 件
        </el-form-item>
        <el-form-item>
          <label for="type">提货方式：</label>
          {{ parseOrderType(type) }}
        </el-form-item>
        <el-form-item>
          <label for="totalPrice">总价：</label>
          {{ totalPrice }} 元
        </el-form-item>

        <el-form-item>
          <label>优惠券：</label>
          <el-select v-model="couponId" @change = "getRealPrice(couponId)" >
            <el-option
                :label="`不使用优惠券`"
                :value="0"
            ></el-option>
            <div v-for="coupon in coupons" :key="coupon.id">
              <div v-if="coupon.type === 'FULL_REDUCTION' && coupon.full <= price * amount && !coupon.used">
                <el-option
                    :label="`满${coupon.full}减${coupon.reduction}`"
                    :value="coupon.id"
                ></el-option>
              </div>
            </div>
            <div v-for="coupon in coupons" :key="coupon.id">
              <div v-if="coupon.type === 'SPECIAL' && !coupon.used">
                <el-option
                    :label="`蓝鲸券`"
                    :value="coupon.id"
                ></el-option>
              </div>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item>
          <label>折扣后金额：</label>
          {{ realPrice }} 元
        </el-form-item>

      </el-form>

      <el-button @click="handleConfirmOrder" type="primary" plain>确认支付</el-button>
    </div>
  </el-dialog>
</template>


<style scoped>
.pay-dialog-title {
  font-size: 30px;
  margin-bottom: 20px;
}
</style>