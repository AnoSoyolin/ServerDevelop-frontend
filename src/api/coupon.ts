import {axios} from '../utils/request'
import {COUPON_MODULE} from './_prefix'

type CouponGroupInfo = {
    amount: number,
    storeId: number,
    type: string,
    full: number,
    reduction: number,
}

type CouponInfo = {
    userId: number,
    storeId: number,
    groupId: number,
    type : string;
    full: number,
    reduction: number,
}

export const createGroup = (couponGroupInfo: CouponGroupInfo) => {
    return axios.post(`${COUPON_MODULE}/createGroup`, couponGroupInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

export const getAllGroup = () => {
    return axios.get(`${COUPON_MODULE}/`)
        .then(res => {
            return res
        })

}

export const receiveCoupon = (couponInfo:CouponInfo) => {
    return axios.post(`${COUPON_MODULE}/receive`, couponInfo,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

export const getAvailableCoupons= (userId: number,orderId:number) => {
    return axios.get(`${COUPON_MODULE}/user/?userId=${userId}&orderId=${orderId}`)
        .then(res => {
            return res
        })
}

export const getGroupByGroupId = (groupId: number) => {
    return axios.get(`${COUPON_MODULE}/${groupId}`)
        .then(res => {
            return res
        })
}