<!-- src/App.vue -->
<template>
  <div class="app-container">
    <el-container>
      <el-aside width="200px" v-if="showSidebar">
        <el-menu
          :default-active="activeIndex"
          class="el-menu-vertical"
          @select="handleSelect"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b">
          <el-menu-item index="1">
            <el-icon><Document /></el-icon>
            <span>RAG评估</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><ChatLineRound /></el-icon>
            <span>Prompt评估</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-container">
            <div class="logo">RAG评估系统</div>
            <div class="user-info">
              <span v-if="authStore.isAuthenticated">欢迎，{{ authStore.userPhone }}</span>
              <el-button v-if="authStore.isAuthenticated" type="danger" size="small" @click="handleLogout">退出登录</el-button>
            </div>
          </div>
        </el-header>
        <el-main>
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Document, ChatLineRound, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from './store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const activeIndex = ref('1')

const showSidebar = computed(() => {
  return authStore.isAuthenticated && route.path !== '/login' && route.path !== '/register'
})

// 监听路由变化，更新 activeIndex
watch(() => route.path, (newPath) => {
  if (newPath === '/rag') {
    activeIndex.value = '1'
  } else if (newPath === '/prompt') {
    activeIndex.value = '2'
  } else if (newPath === '/profile') {
    activeIndex.value = '3'
  }
}, { immediate: true })

const handleSelect = (key: string) => {
  switch (key) {
    case '1':
      router.push('/rag')
      break
    case '2':
      router.push('/prompt')
      break
    case '3':
      router.push('/profile')
      break
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
  width: 100%;
}

.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #545c64;
  height: 100%;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.nav-menu {
  flex: 1;
  margin: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>
