<!-- src/components/EvaluationChart.vue -->
<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  // data 格式：[{ round, accuracy, recall }, ...]
  data: {
    type: Array,
    required: true
  },
  // evaluationType 用于标题区分 RAG 或 Prompt（可扩展指标）
  evaluationType: {
    type: String,
    default: 'RAG'
  }
})

const chartRef = ref(null)
let chartInstance = null

function renderChart() {
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
  }
  // x 轴使用轮次（例如：轮次1、轮次2等）
  const rounds = props.data.map(item => "轮次" + item.round)
  const accuracy = props.data.map(item => item.accuracy)
  const recall = props.data.map(item => item.recall)

  const option = {
    title: { text: props.evaluationType === 'RAG' ? 'RAG 评估指标' : 'Prompt 评估指标' },
    tooltip: {},
    legend: {
      data: ['准确率', '召回率']
    },
    xAxis: { data: rounds },
    yAxis: {},
    series: [
      {
        name: '准确率',
        type: 'line',
        data: accuracy
      },
      {
        name: '召回率',
        type: 'line',
        data: recall
      }
    ]
  }
  chartInstance.setOption(option)
}

onMounted(() => {
  renderChart()
})

watch(() => props.data, () => {
  renderChart()
}, { deep: true })
</script>

<style scoped>
.chart-container {
  width: 600px;
  height: 400px;
  margin: 20px auto;
}
</style>
