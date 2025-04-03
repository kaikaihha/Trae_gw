<template>
  <div class="not-found-container" :class="{ 'is-mobile': isMobile }">
    <div class="not-found-box">
      <el-result
        v-if="!isMobile"
        icon="warning"
        title="404"
        sub-title="抱歉，您访问的页面不存在"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/home')">返回首页</el-button>
        </template>
      </el-result>

      <van-empty
        v-else
        description="抱歉，您访问的页面不存在"
      >
        <van-button round type="primary" block @click="$router.push('/home')">返回首页</van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.not-found-box {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin: 0 1rem;
}

.not-found-container.is-mobile {
  background-color: #fff;
}

.not-found-container.is-mobile .not-found-box {
  box-shadow: none;
  padding: 1rem;
}
</style>