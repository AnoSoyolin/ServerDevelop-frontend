<template>
  <div class="rag-container">
    <!-- 任务管理区域 -->
    <div class="task-management">
      <el-card class="task-card">
        <template #header>
          <div class="card-header">
            <span>RAG评估任务管理</span>
            <el-button type="primary" @click="showCreateTaskDialog">创建任务</el-button>
          </div>
        </template>

        <!-- 任务列表 -->
        <el-table :data="tasks" style="width: 100%">
          <el-table-column prop="name" label="任务名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="type" label="类型" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="primary" size="small" @click="showEvaluationDialog(scope.row)">评估</el-button>
              <el-button type="danger" size="small" @click="deleteSelectedTask(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 评估区域 -->
    <div class="evaluation-area" v-if="selectedTask">
      <el-card class="evaluation-card">
        <template #header>
          <div class="card-header">
            <span>评估记录 - {{ selectedTask.name }}</span>
            <el-button type="primary" @click="showNewEvaluationDialog">新增评估</el-button>
          </div>
        </template>

        <!-- 评估记录表格 -->
        <el-table :data="evaluations" style="width: 100%">
          <el-table-column prop="roundNum" label="轮次" />
          <el-table-column prop="dataset" label="数据集" :formatter="formatDataset" />
          <el-table-column label="指标">
            <template #default="scope">
              <div class="metric-tags">
                <el-tag
                    v-for="metric in scope.row.metrics"
                    :key="metric"
                    class="metric-tag"
                >
                  {{ translateMetric(metric) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="结果">
            <template #default="scope">
              <div class="result-tags">
                <el-tag
                    v-for="(result, index) in scope.row.results || []"
                    :key="index"
                    class="result-tag"
                >
                  {{ result }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" @click="showDetailDialog(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-dialog v-model="detailDialogVisible" title="评估详情" width="600px">
          <el-card shadow="hover">
            <div>
              <strong>数据集：</strong>
              <pre style="white-space: pre-wrap; word-break: break-word;">{{ formatJson(selectedEvaluation?.dataset || '') }}</pre>

            </div>
          </el-card>

          <el-divider />

          <el-table :data="metricResultTableData" style="width: 100%"
                    :header-cell-style="{ textAlign: 'center' }"
                    :cell-style="{ textAlign: 'center' }">
            <el-table-column prop="metric" label="指标">
              <template #default="scope">
                <el-tag type="success">{{ translateMetric(scope.row.metric) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="result" label="结果">
              <template #default="scope">
                <el-tag>{{ scope.row.result }}</el-tag>
              </template>
            </el-table-column>
          </el-table>

          <template #footer>
            <el-button @click="detailDialogVisible = false">关闭</el-button>
          </template>
        </el-dialog>


        <!-- 可视化图表 -->
        <div class="chart-container" v-if="evaluations.length > 0">
          <div class="chart-title">评估指标趋势</div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-card>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="createTaskDialogVisible" title="创建RAG评估任务">
      <el-form :model="newTask" :rules="taskRules" ref="taskFormRef">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="newTask.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="newTask.description" type="textarea" placeholder="请输入任务描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createTaskDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createNewTask">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增评估对话框 -->
    <el-dialog v-model="evaluationDialogVisible" title="新增评估">
      <el-form :model="newEvaluation" :rules="evaluationRules" ref="evaluationFormRef">
        <el-form-item label="数据集" prop="dataset">
          <div v-if="uploadedFileName">
            <p><strong>已上传文件：</strong>{{ uploadedFileName }}</p>
            <el-button type="danger" @click="clearUploadedFile" style="margin-top: 10px;">
              重新上传
            </el-button>
          </div>
          <div v-else>
            <el-upload
                class="dataset-upload"
                :on-change="handleJsonFileRead"
                :limit="1"
                :auto-upload="false"
                accept=".json"
                :show-file-list="false"
            >
              <el-button type="primary">上传 JSON 数据集</el-button>
            </el-upload>
            <div class="el-upload__tip">只能上传 JSON 文件，大小不超过 2MB
              <br>文件必须包含'question', 'answer', 'contexts', 'reference'字段</div>
          </div>
        </el-form-item>
        <el-form-item label="评估指标" prop="metrics">
          <el-select v-model="newEvaluation.metrics" multiple placeholder="请选择评估指标">
            <el-option label="忠实性" value="faithfulness" />
            <el-option label="答案相关性" value="answer_relevancy" />
            <el-option label="上下文精确率" value="context_precision" />
            <el-option label="上下文召回率" value="context_recall" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="evaluationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createEvaluation">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import {ElMessage, UploadFile} from 'element-plus'
import { createTask, getAllTasks, deleteTask, getCharts } from './../api/task'
import {createRAGEvaluation,getRAGEvaluationByTaskId} from './../api/RAG'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import {Task, Evaluation} from "../types";

const router = useRouter()

// 任务相关
const tasks = ref<Task[]>([])
const selectedTask = ref<Task>()
const createTaskDialogVisible = ref(false)
const newTask = reactive({
  name: '',
  description: '',
  type: 'RAG'
})

// 评估相关
const evaluations = ref<Evaluation[]>([])
const evaluationDialogVisible = ref(false)
const newEvaluation = reactive({
  dataset: '',
  metrics: [],
  results: []
})

const detailDialogVisible = ref(false)
const selectedEvaluation = ref<Evaluation | null>(null)
const metricResultTableData = ref<{ metric: string, result: string | number }[]>([])

const showDetailDialog = (evaluation: Evaluation) => {
  selectedEvaluation.value = evaluation
  metricResultTableData.value = (evaluation.metrics || []).map((metric, i) => ({
    metric,
    result: evaluation.results?.[i] ?? 'N/A'
  }))
  detailDialogVisible.value = true
}

const formatJson = (jsonStr: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2)
  } catch (e) {
    return jsonStr
  }
}


// 图表相关
const chartRef = ref()
let chart = null

// 表单验证规则
const taskRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入任务描述', trigger: 'blur' }]
}

const evaluationRules = {
  dataset: [{ required: true, message: '请上传数据集', trigger: 'change' }],
  metrics: [{ required: true, message: '请选择评估指标', trigger: 'change' }]
}

// 显示创建任务对话框
const showCreateTaskDialog = () => {
  createTaskDialogVisible.value = true
}

// 显示评估对话框
const showEvaluationDialog = (task:Task) => {
  selectedTask.value = task
  fetchEvaluations(task.id)
}

// 显示新增评估对话框
const showNewEvaluationDialog = () => {
  evaluationDialogVisible.value = true
}

// 初始化
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  await fetchTasks()
  await nextTick()
  if (chartRef.value) {
    initChart()
  }
})

// 获取任务列表
const fetchTasks = async () => {
  try {
    const res = await getAllTasks()
    if (res.status === 200) {
      tasks.value = res.data.result
    } else {
      ElMessage.error('获取任务列表失败')
      tasks.value = []
    }
  } catch (error) {
    ElMessage.error('获取任务列表失败')
    tasks.value = []
  }
}

// 创建任务
const createNewTask = async () => {
  try {
    const res = await createTask(newTask)
    if (res.status === 200) {
      ElMessage.success('创建任务成功')
      createTaskDialogVisible.value = false
      await fetchTasks()
    } else {
      ElMessage.error(res.data.msg || '创建任务失败')
    }
  } catch (error) {
    ElMessage.error('创建任务失败')
  }
}

// 删除任务
const deleteSelectedTask = async (taskId: number) => {
  try {
    const res = await deleteTask(taskId)
    if (res.status === 200) {
      ElMessage.success('删除任务成功')
      await fetchTasks()
    } else {
      ElMessage.error(res.data.msg || '删除任务失败')
    }
  } catch (error) {
    ElMessage.error('删除任务失败')
  }
}

// 获取评估记录
const fetchEvaluations = async (taskId: number) => {
  try {
    const res = await getRAGEvaluationByTaskId(taskId);
    console.log(res)
    if (res.status === 200) {
      evaluations.value = res.data.result
      updateChart()
    } else {
      ElMessage.error('获取评估记录失败')
      evaluations.value = []
    }
  } catch (error) {
    ElMessage.error('获取评估记录失败')
    evaluations.value = []
  }
}

// 创建评估
const createEvaluation = async () => {
  try {
    if (!selectedTask.value) {
      ElMessage.error('未选择任务，无法创建评估')
      return
    }
    const res = await createRAGEvaluation(selectedTask.value.id,{
      ...newEvaluation
    })
    if (res.status === 200) {
      ElMessage.success('创建评估成功')
      evaluationDialogVisible.value = false
      await fetchEvaluations(selectedTask.value.id)
    } else {
      ElMessage.error(res.data.msg || '创建评估失败')
    }
  } catch (error) {
    ElMessage.error('创建评估失败')
  }
}

// 文件上传
const uploadedFileName = ref('')

const handleJsonFileRead = (uploadFile: UploadFile) => {
  const file = uploadFile.raw // 获取原始 File 对象
  if (!file) return

  const isJSON = file.type === 'application/json'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJSON) {
    ElMessage.error('只能上传 JSON 文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('文件大小不能超过 2MB!')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const content = JSON.parse(event.target?.result as string)

      const requiredFields = ['question', 'answer', 'contexts', 'reference']
      for (const field of requiredFields) {
        if (!(field in content)) {
          ElMessage.error(`文件缺少必要的字段: ${field}`)
          return
        }
      }

      newEvaluation.dataset = JSON.stringify(content) // 转化为字符串
      uploadedFileName.value = file.name
      ElMessage.success('上传成功')
    } catch (error) {
      ElMessage.error('文件解析失败，请上传正确的 JSON 文件!')
    }
  }
  reader.readAsText(file) // 读取文件内容
}

// 格式化数据集显示，控制显示长度
const formatDataset = (row: Evaluation) => {
  const datasetLength = row.metrics.length * 30
  return row.dataset.length > datasetLength
      ? row.dataset.slice(0, datasetLength) + '...'
      : row.dataset
}

// 翻译指标名称为中文
const translateMetric = (metric: string) => {
  const metricMap: { [key: string]: string } = {
    faithfulness: '忠实性',
    answer_relevancy: '答案相关性',
    context_precision: '上下文精确率',
    context_recall: '上下文召回率'
  }

  return metricMap[metric] || metric
}


const clearUploadedFile = () => {
  uploadedFileName.value = ''
}

// 初始化图表
const initChart = () => {
  chart = echarts.init(chartRef.value)
}

// 更新图表
const updateChart = () => {
  if (!chart) return
  const option = {
    title: {
      text: '评估指标趋势'
    },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: evaluations.value.map(ev => `轮次 ${ev.roundNum}`)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: evaluations.value.map(ev => ev.results[0]), // 示例数据，只取第一个评估结果
        type: 'line'
      }
    ]
  }

  chart.setOption(option)
}
</script>

<style scoped>
.rag-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-upload__tip {
  color: #888;
}

.dataset-upload {
  margin-top: 10px;
}

.metric-tags, .result-tags {
  display: flex;
  flex-direction: column; /* Align tags vertically */
  gap: 8px; /* Space between the tags */
}

.metric-tag {
  margin: 0;
  min-width: 100px;  /* 指标标签稍宽 */
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-tag {
  margin: 0;
  min-width: 50px;  /* 结果标签略窄 */
  max-width: 50px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-container {
  margin-top: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: bold;
}

.chart {
  width: 100%;
  height: 400px;
}

</style>
