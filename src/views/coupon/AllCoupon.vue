<script setup lang="ts">
import {ref} from "vue"
import {createGroup, getAllGroup} from "../../api/coupon.ts"
import CouponItem from "../../components/CouponItem.vue"

const role = sessionStorage.getItem("role")
const amount=ref(0)
let storeId=ref(0);
storeId=ref(0)
const type = ref('')
const full=ref(0)
const reduction=ref(0)
const groupList = ref()
if (role==="STAFF"){
  storeId.value=Number(sessionStorage.getItem("storeId"))
}
getAllGroup().then(res => {
  groupList.value = res.data.result
})
const couponDialogVisible=ref(false)
function closeCouponDialog() {
  couponDialogVisible.value = false;
}
function openCouponDialog() {
  couponDialogVisible.value = true;
}
function createNewGroup() {
  createGroup({
    amount: amount.value,
    storeId: storeId.value,
    type: type.value,
    full: full.value,
    reduction: reduction.value,
  }).then(res => {
    if (res.data.code === '000') {
      ElMessage({
        message: '发布优惠券成功！',
        type: 'success',
        center: true,
      })
      closeCouponDialog()
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
  <el-button v-if="role!='CUSTOMER'" @click="openCouponDialog" type="primary" class="button" plain>
    发布优惠券
  </el-button>
  <el-dialog
      v-model="couponDialogVisible"
      title="发布优惠券"
      width="400px"
      @close="closeCouponDialog">

    <el-form label-position="top">
      <el-form-item label="优惠券数量">
        <el-input-number v-model="amount" :min="1"  label="购买数量"></el-input-number>
      </el-form-item>
      <el-form-item label="优惠券类型">
        <el-radio-group v-model="type">
          <el-radio label="FULL_REDUCTION">满减券</el-radio>
          <el-radio label="SPECIAL">蓝鲸券</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="type==='FULL_REDUCTION'" label="使用限额">
        <el-input-number v-model="full" placeholder="使用限额"></el-input-number>
      </el-form-item>
      <el-form-item v-if="type==='FULL_REDUCTION'" label="减免金额">
        <el-input-number v-model="reduction" placeholder="减免金额"></el-input-number>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="closeCouponDialog">取 消</el-button>
      <el-button type="primary" @click="createNewGroup">确 定</el-button>
    </div>
  </el-dialog>

  <el-main>
    <div class="group-item-list">
      <CouponItem v-for="groupVO in groupList" :groupId="groupVO.id"/>
    </div>
  </el-main>
</template>


<style scoped>
.group-item-list {
  display: flex;
  padding: 2px;
  flex-flow: wrap;
  justify-content: center;
}
.button{
  width: 10%;
  margin-left: 40px;
  margin-top: 20px;
}

</style>
