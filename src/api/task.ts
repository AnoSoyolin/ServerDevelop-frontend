import {axios} from '../utils/request'
import {TASK_MODULE} from './_prefix'

// 创建任务
export const createTask = (taskVO: any) => {
    return axios.post(`${TASK_MODULE}/create`, taskVO, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 获取所有任务
export const getAllTasks = () => {
    return axios.get(`${TASK_MODULE}/getAllTasks`)
        .then(res => {
            return res
        })
}

// 删除任务
export const deleteTask = (taskId: number) => {
    return axios.delete(`${TASK_MODULE}/delete/${taskId}`)
        .then(res => {
            return res
        })
}

// 获取任务
export const getTask = (taskId: number) => {
    return axios.get(`${TASK_MODULE}/getTask/${taskId}`)
        .then(res => {
            return res
        })
}

// 获取任务统计图
export const getCharts = (taskId: number,metric: string) => {
    return axios.get(`${TASK_MODULE}/getCharts/${taskId}?metric=${metric}`)
        .then(res => {
            return res
        })
}