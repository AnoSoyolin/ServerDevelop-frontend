import {axios} from '../utils/request'
import {PROMPT_MODULE} from './_prefix'

//创建提示
export const createPrompt = (taskId: number, evaluationVO: any) => {
    return axios.post(`${PROMPT_MODULE}/create?taskId=${taskId}`, evaluationVO, {
        headers: {'Content-Type': 'application/json'}
    }).then(res => {
        return res
    })
}

//获取所有提示
export const getAllPromptEval = () => {
    return axios.get(`${PROMPT_MODULE}/getAll`)
        .then(res => {
            return res
        })
}

//删除提示
export const deletePromptEval = (promptId: number) => {
    return axios.delete(`${PROMPT_MODULE}/delete/${promptId}`)
        .then(res => {
            return res
        })
}

//获取提示
export const getPromptEval = (promptId: number) => {
    return axios.get(`${PROMPT_MODULE}/getPrompt/${promptId}`)
        .then(res => {
            return res
        })
}