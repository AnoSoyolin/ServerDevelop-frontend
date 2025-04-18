import {createRouter, createWebHistory} from "vue-router"
import type { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login',
    }, {
        path: '/login',
        name: 'Login',
        component: () => import('../views/user/Login.vue'),
        meta: {title: '用户登录'}
    }, {
        path: '/register',
        name: 'Register',
        component: () => import('../views/user/Register.vue'),
        meta: {title: '用户注册'}
    }, {
        path: '/home',
        redirect: '/rag',
        component: () => import('../views/Home.vue'),
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import('../views/user/Dashboard.vue'),
                meta: {title: '个人信息'}
            },
        ]
    }, {
        path: '/rag',
        name: 'RAG',
        component: () => import('../views/RAGEvaluation.vue'),
        meta: { requiresAuth: true }
    }, {
        path: '/prompt',
        name: 'Prompt',
        component: () => import('../views/PromptEvaluation.vue'),
        meta: { requiresAuth: true }
    }, {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { requiresAuth: true }
    }, {
        path: '/404',
        name: '404',
        component: () => import('../views/NotFound.vue'),
        meta: {title: '404'}
    }, {
        path: '/:catchAll(.*)',
        redirect: '/404'
    }]


const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    
    if (to.meta.requiresAuth && !token) {
        ElMessage.error('请先登录')
        next('/login')
    } else {
        next()
    }
})

export {router}
