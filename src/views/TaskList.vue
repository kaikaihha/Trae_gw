<template>
  <div class="task-list-container">
    <!-- 移动端界面 -->
    <template v-if="isMobile">
      <van-nav-bar title="打卡任务" />
      
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell-group inset v-for="task in tasks" :key="task.id">
            <van-cell :title="task.name" :label="task.description">
              <template #right-icon>
                <van-tag :type="task.status === 'pending' ? 'warning' : 'success'">
                  {{ task.status === 'pending' ? '待完成' : '已完成' }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="打卡类型" :value="task.type === 'range' ? '范围打卡' : '位置打卡'" />
            <van-cell title="截止时间" :value="task.deadline" />
            <div class="task-actions">
              <van-button
                v-if="task.status === 'pending'"
                type="primary"
                size="small"
                block
                @click="goToCheckin(task)"
              >
                去打卡
              </van-button>
            </div>
          </van-cell-group>
        </van-list>
      </van-pull-refresh>
    </template>
    
    <!-- PC端界面 -->
    <template v-else>
      <div class="pc-container">
        <div class="header">
          <h2>打卡任务</h2>
          <el-button type="primary" @click="refreshTasks">刷新</el-button>
        </div>
        
        <el-table :data="tasks" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="任务名称" />
          <el-table-column prop="description" label="任务描述" show-overflow-tooltip />
          <el-table-column prop="type" label="打卡类型">
            <template #default="{ row }">
              {{ row.type === 'range' ? '范围打卡' : '位置打卡' }}
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止时间" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === 'pending' ? 'warning' : 'success'">
                {{ row.status === 'pending' ? '待完成' : '已完成' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                type="primary"
                link
                @click="goToCheckin(row)"
              >
                去打卡
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckinStore } from '../stores/checkin'
import { showToast, showSuccessToast } from 'vant'
import { ElMessage } from 'element-plus'

const router = useRouter()
const checkinStore = useCheckinStore()

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 响应式数据
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const tasks = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 示例任务数据（实际应从后端获取）
const mockTasks = [
  {
    id: '1',
    name: '总部每日打卡',
    description: '请在工作时间内完成总部打卡',
    type: 'range',
    target: [116.397428, 39.90923],
    status: 'pending',
    deadline: '2024-01-20 18:00'
  },
  {
    id: '2',
    name: '东城区商圈巡检',
    description: '完成东城区商圈日常巡检打卡',
    type: 'location',
    target: 'dongcheng',
    status: 'pending',
    deadline: '2024-01-20 17:30'
  }
]

// 获取任务列表
const fetchTasks = async () => {
  try {
    loading.value = true
    // 实际项目中应调用后端API
    // const response = await checkinStore.fetchTasks({
    //   page: currentPage.value,
    //   pageSize: pageSize.value
    // })
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    tasks.value = mockTasks
    total.value = mockTasks.length
    
    if (isMobile.value) {
      finished.value = true // 示例数据都加载完成
    }
  } catch (error) {
    const message = '获取任务列表失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 刷新任务列表
const refreshTasks = () => {
  currentPage.value = 1
  fetchTasks()
}

// 移动端下拉刷新
const onRefresh = () => {
  finished.value = false
  refreshTasks()
}

// 移动端加载更多
const onLoad = () => {
  fetchTasks()
}

// PC端分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  refreshTasks()
}

// PC端页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchTasks()
}

// 跳转到打卡页面
const goToCheckin = (task) => {
  router.push({
    path: '/unified-checkin',
    query: { taskId: task.id }
  })
}

// 初始化
onMounted(() => {
  fetchTasks()
})
</script>

<style scoped lang="scss">
.task-list-container {
  height: 100%;
  background-color: #f5f7fa;
  
  .task-actions {
    padding: 8px 16px 16px;
  }
}

.pc-container {
  padding: 20px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      color: #303133;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>