import {axios} from '../utils/request'
import {RAG_MODULE} from './_prefix'

//创建RAG评估
export const createRAGEvaluation = (taskId: number, evaluationVO: any) => {
    return axios.post(`${RAG_MODULE}/create?taskId=${taskId}`, evaluationVO, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

//获取所有RAG评估
export const getAllRAGEvaluations = () => {
    return axios.get(`${RAG_MODULE}/getAllEvaluations`)
        .then(res => {
            return res
        })
}

//删除RAG评估
export const deleteRAGEvaluation = (evaluationId: number) => {
    return axios.delete(`${RAG_MODULE}/delete/${evaluationId}`)
        .then(res => {
            return res
        })
}

//获取RAG评估
export const getRAGEvaluation = (evaluationId: number) => {
    return axios.get(`${RAG_MODULE}/getEvaluation/${evaluationId}`)
        .then(res => {
            return res
        })
}

//根据TaskId获取对应的RAG评估
export const getRAGEvaluationByTaskId = (taskId: number) => {
    return axios.get(`${RAG_MODULE}/getEvalByTaskId/${taskId}`)
        .then(res => {
            return res
        })
}