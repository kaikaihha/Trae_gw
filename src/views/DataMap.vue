<template>
  <div class="data-map-container">
    <div class="map-container" ref="mapContainer"></div>
    
    <!-- 移动端界面 -->
    <template v-if="isMobile">
      <van-form class="filter-form">
        <van-cell-group inset>
          <van-field
            v-model="filterData.dateRange"
            name="dateRange"
            label="日期范围"
            readonly
            @click="showDatePicker = true"
          />
          <van-field
            v-model="filterData.department"
            name="department"
            label="部门"
            readonly
            @click="showDepartmentPicker = true"
          />
        </van-cell-group>
      </van-form>
      
      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker
          v-model="selectedDate"
          type="range"
          title="选择日期范围"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>
      
      <!-- 部门选择器 -->
      <van-popup v-model:show="showDepartmentPicker" position="bottom">
        <van-picker
          :columns="departmentOptions"
          @confirm="onDepartmentSelect"
          @cancel="showDepartmentPicker = false"
          title="选择部门"
          show-toolbar
        />
      </van-popup>
      
      <!-- 数据统计 -->
      <van-card class="stats-card">
        <template #title>
          <div class="stats-title">打卡统计</div>
        </template>
        <template #desc>
          <div class="stats-content">
            <div class="stats-item">
              <span class="label">总打卡次数：</span>
              <span class="value">{{ statistics.total }}</span>
            </div>
            <div class="stats-item">
              <span class="label">有效打卡：</span>
              <span class="value">{{ statistics.valid }}</span>
            </div>
            <div class="stats-item">
              <span class="label">无效打卡：</span>
              <span class="value">{{ statistics.invalid }}</span>
            </div>
          </div>
        </template>
      </van-card>
    </template>
    
    <!-- PC端界面 -->
    <template v-else>
      <el-card class="filter-card">
        <template #header>
          <div class="card-header">
            <span>筛选条件</span>
            <div class="header-actions">
              <el-button type="primary" @click="exportData" :loading="exporting">
                导出数据
              </el-button>
            </div>
          </div>
        </template>
        
        <el-form :model="filterData" label-width="100px" class="filter-form">
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filterData.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="部门">
            <el-select
              v-model="filterData.department"
              placeholder="请选择部门"
              style="width: 100%"
            >
              <el-option
                v-for="dept in departmentOptions"
                :key="dept.value"
                :label="dept.text"
                :value="dept.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
      
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>打卡统计</span>
          </div>
        </template>
        
        <el-row :gutter="20" class="stats-row">
          <el-col :span="8">
            <div class="stats-item">
              <div class="label">总打卡次数</div>
              <div class="value">{{ statistics.total }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stats-item">
              <div class="label">有效打卡</div>
              <div class="value">{{ statistics.valid }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stats-item">
              <div class="label">无效打卡</div>
              <div class="value">{{ statistics.invalid }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCheckinStore } from '../stores/checkin'
import { showToast } from 'vant'
import { ElMessage } from 'element-plus'
import MapService from '../utils/map'

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 状态管理
const checkinStore = useCheckinStore()

// 响应式数据
const mapContainer = ref(null)
const loading = ref(false)
const exporting = ref(false)
const showDatePicker = ref(false)
const showDepartmentPicker = ref(false)
const selectedDate = ref([])

// 日期范围限制
const minDate = new Date(new Date().getFullYear() - 1, 0, 1)
const maxDate = new Date()

// 筛选条件
const filterData = ref({
  dateRange: '',
  department: ''
})

// 部门选项
const departmentOptions = [
  { text: '全部部门', value: '' },
  { text: '销售部', value: 'sales' },
  { text: '市场部', value: 'marketing' },
  { text: '客服部', value: 'service' }
]

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 统计数据
const statistics = ref({
  total: 0,
  valid: 0,
  invalid: 0
})

// 初始化地图和数据
onMounted(async () => {
  try {
    const map = await MapService.initMap(mapContainer.value)
    await loadCheckinData()
  } catch (error) {
    const message = '初始化失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  }
})

// 加载打卡数据
const loadCheckinData = async () => {
  loading.value = true
  try {
    const data = await checkinStore.fetchCheckinHistory()
    updateStatistics(data)
    showCheckinMarkers(data)
  } catch (error) {
    const message = '加载数据失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStatistics = (data) => {
  statistics.value = {
    total: data.length,
    valid: data.filter(item => item.status === 'success').length,
    invalid: data.filter(item => item.status !== 'success').length
  }
}

// 在地图上显示打卡标记
const showCheckinMarkers = (data) => {
  data.forEach(item => {
    MapService.addCheckinMarker(
      item.location,
      {
        title: `${item.username} - ${new Date(item.timestamp).toLocaleString()}`,
        status: item.status
      }
    )
  })
}

// 日期选择确认
const onDateConfirm = (value) => {
  filterData.value.dateRange = value
  showDatePicker.value = false
  loadCheckinData()
}

// 部门选择确认
const onDepartmentSelect = (value) => {
  filterData.value.department = value
  showDepartmentPicker.value = false
  loadCheckinData()
}

// 导出数据
const exportData = async () => {
  exporting.value = true
  try {
    // 实际项目中应该调用后端API导出数据
    const message = '数据导出成功'
    isMobile.value ? showToast(message) : ElMessage.success(message)
  } catch (error) {
    const message = '数据导出失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped lang="scss">
.data-map-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .map-container {
    height: 50%;
    width: 100%;
    margin-bottom: 16px;
  }
  
  .filter-card,
  .stats-card {
    margin: 16px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .stats-row {
    text-align: center;
  }
  
  .stats-item {
    padding: 16px;
    
    .label {
      color: #666;
      margin-bottom: 8px;
    }
    
    .value {
      font-size: 24px;
      font-weight: bold;
      color: #409EFF;
    }
  }
}

// 移动端样式调整
.is-mobile {
  .map-container {
    height: 40%;
  }
  
  .filter-form {
    margin: 16px 0;
  }
  
  .stats-card {
    margin: 16px;
    
    .stats-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .stats-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .stats-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .label {
        color: #666;
      }
      
      .value {
        font-weight: bold;
        color: #409EFF;
      }
    }
  }
}
</style>