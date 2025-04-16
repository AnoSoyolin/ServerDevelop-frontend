import {axios} from '../utils/request'
import {USER_MODULE} from './_prefix'
import {loginInfo, UserVO} from "../types";

// 如果有“Vue: This may be converted to an async function”警告，可以不管
// 用户登录
export const userLogin = (info: loginInfo) => {
    return axios.post(`${USER_MODULE}/login`, null, {params: info})
        .then(res => {
            return res
        })
}

// 用户注册
export const userRegister = (userVO: UserVO) => {
    return axios.post(`${USER_MODULE}/register`, userVO,
        {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 获取用户信息
export const userInfo = () => {
    return axios.get(`${USER_MODULE}`)
        .then(res => {
            return res
        })
}

// 更新用户信息
export const userInfoUpdate = (userVO: UserVO) => {
    return axios.post(`${USER_MODULE}`, userVO, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}


