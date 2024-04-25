import {axios} from '../utils/request'
import {COUPON_MODULE} from './_prefix'

type CouponGroupInfo = {
    amount: number,
    storeId: number,
    userId: number,
    type: string,
    Full: number,
    Reduction: number,
}

type CouponInfo = {
    userId: number,
    storeId: number,
    couponGroupId: number,
    type : string;
    Full: number,
    Reduction: number,
}

export const createGroup = (couponGroupInfo: CouponGroupInfo) => {
    return axios.post(`${COUPON_MODULE}/`, couponGroupInfo,
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

export const getCouponsByUserId = (userId: number) => {
    return axios.get(`${COUPON_MODULE}/user/${userId}`)
        .then(res => {
            return res
        })
}

export const getCouponsByCouponId = (couponId: number) => {
    return axios.get(`${COUPON_MODULE}/${couponId}`)
        .then(res => {
            return res
        })
}