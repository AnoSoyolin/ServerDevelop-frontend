<!-- src/pages/PromptEvaluation.vue -->
<template>
  <div class="prompt-container">
    <!-- 任务管理区域 -->
    <div class="task-management">
      <el-card class="task-card">
        <template #header>
          <div class="card-header">
            <span>Prompt评估任务管理</span>
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
              <el-button type="danger" size="small" @click="deleteTask(scope.row.id)">删除</el-button>
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
          <el-table-column prop="round_num" label="轮次" />
          <el-table-column prop="prompt" label="Prompt内容" />
          <el-table-column label="评估指标">
            <template #default="scope">
              <el-tag v-for="metric in scope.row.metrics" :key="metric" class="metric-tag">
                {{ metric }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="结果">
            <template #default="scope">
              <el-tag v-for="(result, index) in scope.row.results" :key="index" class="result-tag">
                {{ result }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="showOptimizeDialog(scope.row)">优化</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 可视化图表 -->
        <div class="chart-container" v-if="evaluations.length > 0">
          <div class="chart-title">评估指标趋势</div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-card>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="createTaskDialogVisible" title="创建Prompt评估任务">
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
          <el-button type="primary" @click="createTask">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增评估对话框 -->
    <el-dialog v-model="evaluationDialogVisible" title="新增评估">
      <el-form :model="newEvaluation" :rules="evaluationRules" ref="evaluationFormRef">
        <el-form-item label="Prompt内容" prop="prompt">
          <el-input v-model="newEvaluation.prompt" type="textarea" placeholder="请输入Prompt内容" />
        </el-form-item>
        <el-form-item label="评估指标" prop="metrics">
          <el-select v-model="newEvaluation.metrics" multiple placeholder="请选择评估指标">
            <el-option label="相关性" value="relevance" />
            <el-option label="完整性" value="completeness" />
            <el-option label="清晰度" value="clarity" />
            <el-option label="一致性" value="consistency" />
            <el-option label="自定义指标" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="newEvaluation.metrics.includes('custom')" label="自定义指标" prop="customMetric">
          <el-input v-model="newEvaluation.customMetric" placeholder="请输入自定义指标名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="evaluationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createEvaluation">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 优化对话框 -->
    <el-dialog v-model="optimizeDialogVisible" title="优化Prompt">
      <el-form :model="optimizedPrompt" :rules="optimizeRules" ref="optimizeFormRef">
        <el-form-item label="当前Prompt" prop="currentPrompt">
          <el-input v-model="optimizedPrompt.currentPrompt" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="优化建议" prop="suggestions">
          <el-input v-model="optimizedPrompt.suggestions" type="textarea" placeholder="请输入优化建议" />
        </el-form-item>
        <el-form-item label="优化后的Prompt" prop="optimizedPrompt">
          <el-input v-model="optimizedPrompt.optimizedPrompt" type="textarea" placeholder="请输入优化后的Prompt" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="optimizeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitOptimization">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { createTask, getAllTasks, deleteTask, getCharts } from './../api/task'
import { createPromptEvaluation, getAllPromptEvaluations, optimizePrompt } from './../api/prompt'
import * as echarts from 'echarts'

// 任务相关
const tasks = ref([])
const selectedTask = ref(null)
const createTaskDialogVisible = ref(false)
const newTask = reactive({
  name: '',
  description: '',
  type: 'Prompt'
})

// 评估相关
const evaluations = ref([])
const evaluationDialogVisible = ref(false)
const newEvaluation = reactive({
  prompt: '',
  metrics: [],
  customMetric: '',
  results: []
})

// 优化相关
const optimizeDialogVisible = ref(false)
const optimizedPrompt = reactive({
  currentPrompt: '',
  suggestions: '',
  optimizedPrompt: ''
})

// 图表相关
const chartRef = ref()
let chart = null

// 表单验证规则
const taskRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入任务描述', trigger: 'blur' }]
}

const evaluationRules = {
  prompt: [{ required: true, message: '请输入Prompt内容', trigger: 'blur' }],
  metrics: [{ required: true, message: '请选择评估指标', trigger: 'change' }],
  customMetric: [{ required: true, message: '请输入自定义指标名称', trigger: 'blur' }]
}

const optimizeRules = {
  suggestions: [{ required: true, message: '请输入优化建议', trigger: 'blur' }],
  optimizedPrompt: [{ required: true, message: '请输入优化后的Prompt', trigger: 'blur' }]
}

// 初始化
onMounted(async () => {
  await fetchTasks()
  initChart()
})

// 获取任务列表
const fetchTasks = async () => {
  try {
    const res = await getAllTasks()
    tasks.value = res.data
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  }
}

// 创建任务
const createTask = async () => {
  try {
    await createTask(newTask)
    ElMessage.success('创建任务成功')
    createTaskDialogVisible.value = false
    await fetchTasks()
  } catch (error) {
    ElMessage.error('创建任务失败')
  }
}

// 删除任务
const handleDeleteTask = async (taskId: number) => {
  try {
    await deleteTask(taskId)
    ElMessage.success('删除任务成功')
    await fetchTasks()
  } catch (error) {
    ElMessage.error('删除任务失败')
  }
}

// 显示评估对话框
const showEvaluationDialog = (task) => {
  selectedTask.value = task
  fetchEvaluations(task.id)
}

// 获取评估记录
const fetchEvaluations = async (taskId: number) => {
  try {
    const res = await getAllPromptEvaluations()
    evaluations.value = res.data
    updateChart()
  } catch (error) {
    ElMessage.error('获取评估记录失败')
  }
}

// 创建评估
const createEvaluation = async () => {
  try {
    await createPromptEvaluation({
      ...newEvaluation,
      taskId: selectedTask.value.id
    })
    ElMessage.success('创建评估成功')
    evaluationDialogVisible.value = false
    await fetchEvaluations(selectedTask.value.id)
  } catch (error) {
    ElMessage.error('创建评估失败')
  }
}

// 显示优化对话框
const showOptimizeDialog = (evaluation) => {
  optimizedPrompt.currentPrompt = evaluation.prompt
  optimizedPrompt.suggestions = ''
  optimizedPrompt.optimizedPrompt = ''
  optimizeDialogVisible.value = true
}

// 提交优化
const submitOptimization = async () => {
  try {
    await optimizePrompt({
      taskId: selectedTask.value.id,
      ...optimizedPrompt
    })
    ElMessage.success('优化成功')
    optimizeDialogVisible.value = false
    await fetchEvaluations(selectedTask.value.id)
  } catch (error) {
    ElMessage.error('优化失败')
  }
}

// 初始化图表
const initChart = () => {
  chart = echarts.init(chartRef.value)
}

// 更新图表
const updateChart = async () => {
  if (!selectedTask.value) return
  
  try {
    const res = await getCharts(selectedTask.value.id)
    const option = {
      title: {
        text: '评估指标趋势'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: res.data.metrics
      },
      xAxis: {
        type: 'category',
        data: res.data.rounds
      },
      yAxis: {
        type: 'value'
      },
      series: res.data.metrics.map(metric => ({
        name: metric,
        type: 'line',
        data: res.data.results[metric]
      }))
    }
    chart.setOption(option)
  } catch (error) {
    ElMessage.error('获取图表数据失败')
  }
}
</script>

<style scoped>
.prompt-container {
  padding: 20px;
}

.task-management {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-tag, .result-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.chart-container {
  margin-top: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.chart {
  height: 400px;
  width: 100%;
}
</style>
