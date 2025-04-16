<!-- src/pages/RAGEvaluation.vue -->
<template>
  <div class="rag-evaluation">
    <h2>RAG 应用评估</h2>
    <form @submit.prevent="addTask">
      <input v-model="newTask" placeholder="输入任务名称" required />
      <button type="submit">添加任务</button>
    </form>
    <ul>
      <li v-for="(task, index) in tasks" :key="index">
        <div>
          <h3>{{ task.name }}</h3>
          <p>创建时间：{{ task.createTime }}</p>
          <p>评估轮次：{{ task.evaluations.length }}</p>
        </div>
        <button @click="selectTask(index)">查看详情</button>
        <button @click="deleteTask(index)">删除</button>
      </li>
    </ul>
    <div v-if="selectedTask" class="task-detail">
      <h3>任务详情 - {{ selectedTask.name }}</h3>
      <EvaluationChart :data="selectedTask.evaluations" evaluationType="RAG" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EvaluationChart from '../components/EvaluationChart.vue'

const newTask = ref('')
// 每个任务格式：{ name, createTime, evaluations: [ { round, accuracy, recall } ] }
const tasks = ref([])
const selectedTaskIndex = ref(null)

function addTask() {
  const task = {
    name: newTask.value,
    createTime: new Date().toLocaleString(),
    // 模拟 3 轮评估数据（你可根据后端实际数据替换）
    evaluations: [
      { round: 1, accuracy: Math.floor(Math.random() * 20) + 80, recall: Math.floor(Math.random() * 20) + 70 },
      { round: 2, accuracy: Math.floor(Math.random() * 20) + 80, recall: Math.floor(Math.random() * 20) + 70 },
      { round: 3, accuracy: Math.floor(Math.random() * 20) + 80, recall: Math.floor(Math.random() * 20) + 70 }
    ]
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
</script>

<style scoped>
.rag-evaluation {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 4px;
}
.rag-evaluation form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.rag-evaluation ul {
  list-style: none;
  padding: 0;
}
.rag-evaluation li {
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
</style>
