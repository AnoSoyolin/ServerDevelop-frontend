<!-- src/pages/PromptEvaluation.vue -->
<template>
  <div class="prompt-evaluation">
    <h2>Prompt 评估</h2>
    <form @submit.prevent="addTask">
      <input v-model="newTask" placeholder="输入 Prompt 任务名称" required />
      <button type="submit">添加任务</button>
    </form>
    <ul>
      <li v-for="(task, index) in tasks" :key="index">
        <div>
          <h3>{{ task.name }}</h3>
          <p>创建时间：{{ task.createTime }}</p>
          <p>评估轮次：{{ task.evaluations.length }}</p>
          <p>优化轮次：{{ task.optimizations.length }}</p>
        </div>
        <button @click="selectTask(index)">查看详情</button>
        <button @click="deleteTask(index)">删除</button>
      </li>
    </ul>
    <div v-if="selectedTask" class="task-detail">
      <h3>任务详情 - {{ selectedTask.name }}</h3>
      <!-- 使用 EvaluationChart 展示评估数据 -->
      <EvaluationChart :data="selectedTask.evaluations" evaluationType="Prompt" />
      <!-- 展示优化记录 -->
      <div class="optimizations">
        <h4>优化记录</h4>
        <ul>
          <li v-for="(opt, idx) in selectedTask.optimizations" :key="idx">
            <strong>轮次{{ opt.round }}:</strong> {{ opt.description }}
          </li>
        </ul>
        <button @click="addOptimization">添加优化</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EvaluationChart from '../components/EvaluationChart.vue'

const newTask = ref('')
// 每个任务格式：
// { name, createTime, evaluations: [ { round, accuracy, recall } ], optimizations: [ { round, description } ] }
const tasks = ref([])
const selectedTaskIndex = ref(null)

function addTask() {
  const task = {
    name: newTask.value,
    createTime: new Date().toLocaleString(),
    evaluations: [
      { round: 1, accuracy: Math.floor(Math.random() * 20) + 70, recall: Math.floor(Math.random() * 20) + 60 },
      { round: 2, accuracy: Math.floor(Math.random() * 20) + 70, recall: Math.floor(Math.random() * 20) + 60 }
    ],
    optimizations: []  // 优化记录为空
  }
  tasks.value.push(task)
  newTask.value = ''
}

function deleteTask(index) {
  tasks.value.splice(index, 1)
  if (selectedTaskIndex.value === index) {
    selectedTaskIndex.value = null
  }
}

function selectTask(index) {
  selectedTaskIndex.value = index
}

const selectedTask = computed(() => tasks.value[selectedTaskIndex.value] || null)

// 添加优化记录，同时新增一轮评估数据（模拟优化后效果）
function addOptimization() {
  if (selectedTask.value) {
    const newOptRound = selectedTask.value.optimizations.length + 1
    const description = "优化建议：调整参数，尝试不同的 prompt 模板。"
    selectedTask.value.optimizations.push({
      round: newOptRound,
      description
    })
    // 在评估数据中增加一轮（模拟优化后新轮次数据）
    const newEvalRound = selectedTask.value.evaluations.length + 1
    selectedTask.value.evaluations.push({
      round: newEvalRound,
      accuracy: Math.floor(Math.random() * 20) + 70,
      recall: Math.floor(Math.random() * 20) + 60
    })
  }
}
</script>

<style scoped>
.prompt-evaluation {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 4px;
}
.prompt-evaluation form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.prompt-evaluation ul {
  list-style: none;
  padding: 0;
}
.prompt-evaluation li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.task-detail {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.optimizations {
  margin-top: 20px;
}
.optimizations ul {
  list-style: none;
  padding: 0;
}
.optimizations li {
  margin-bottom: 10px;
}
</style>
