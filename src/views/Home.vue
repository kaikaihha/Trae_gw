<template>
  <div class="home-container">
    <!-- 移动端导航栏 -->
    <van-nav-bar
      v-if="isMobile"
      :title="currentRoute.meta.title || '商铺走访填报'"
      left-arrow
      @click-left="goBack"
      fixed
      class="mobile-nav"
    />
    
    <!-- PC端顶部导航 -->
    <el-menu
      v-else
      :default-active="activeMenu"
      mode="horizontal"
      class="pc-nav"
      background-color="#409EFF"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="/home/checkin">
        <el-icon><Location /></el-icon>
        <span>范围打卡</span>
      </el-menu-item>
      <el-menu-item index="/home/location-checkin">
        <el-icon><Position /></el-icon>
        <span>位置打卡</span>
      </el-menu-item>
      <el-menu-item index="/home/info-form">
        <el-icon><Document /></el-icon>
        <span>信息填报</span>
      </el-menu-item>
      <template v-if="isAdmin">
        <el-menu-item index="/home/data-map">
          <el-icon><MapLocation /></el-icon>
          <span>数据地图</span>
        </el-menu-item>
        <el-menu-item index="/home/admin">
          <el-icon><Setting /></el-icon>
          <span>管理中心</span>
        </el-menu-item>
      </template>
      <div class="flex-grow" />
      <el-menu-item @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        <span>退出登录</span>
      </el-menu-item>
    </el-menu>

    <!-- 移动端底部标签栏 -->
    <van-tabbar v-if="isMobile" v-model="activeTab" fixed>
      <van-tabbar-item icon="location" to="/home/checkin">范围打卡</van-tabbar-item>
      <van-tabbar-item icon="aim" to="/home/location-checkin">位置打卡</van-tabbar-item>
      <van-tabbar-item icon="records" to="/home/info-form">信息填报</van-tabbar-item>
      <template v-if="isAdmin">
        <van-tabbar-item icon="chart-trending-o" to="/home/data-map">数据地图</van-tabbar-item>
        <van-tabbar-item icon="setting-o" to="/home/admin">管理中心</van-tabbar-item>
      </template>
    </van-tabbar>

    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'is-mobile': isMobile }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Location, Position, Document, MapLocation, Setting, SwitchButton } from '@element-plus/icons-vue'
import { showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式布局
const isMobile = ref(window.innerWidth <= 768)
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 导航状态
const activeTab = ref(0)
const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route)
const isAdmin = computed(() => userStore.isAdmin)

// 返回上一页
const goBack = () => {
  router.back()
}

// 退出登录
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？',
    })
    await userStore.logout()
    router.push('/login')
  } catch {}
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-nav {
  z-index: 100;
}

.pc-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
}

.flex-grow {
  flex-grow: 1;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  margin-top: 60px;
}

.main-content.is-mobile {
  margin-bottom: 50px;
  padding: 15px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>