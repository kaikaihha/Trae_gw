<template>
  <div class="checkin-container">
    <div class="map-container" ref="mapContainer"></div>
    
    <!-- 移动端界面 -->
    <template v-if="isMobile">
      <van-form @submit="handleCheckin">
        <!-- 任务选择 -->
        <van-cell-group inset>
          <van-field
            v-model="selectedTask.name"
            name="task"
            label="打卡任务"
            placeholder="请选择打卡任务"
            readonly
            @click="showTaskPicker = true"
            :rules="[{ required: true, message: '请选择打卡任务' }]"
          />
          <van-field
            v-if="selectedTask.type === 'location'"
            v-model="checkinData.location_name"
            name="location_name"
            label="打卡地点"
            placeholder="请选择打卡地点"
            readonly
            @click="showLocationPicker = true"
            :rules="[{ required: true, message: '请选择打卡地点' }]"
          />
          <van-field
            v-model="checkinData.remarks"
            name="remarks"
            label="备注"
            type="textarea"
            placeholder="请输入打卡备注"
            :rows="3"
          />
        </van-cell-group>
        
        <div class="location-info">
          <van-cell title="当前位置" :value="currentAddress" />
          <van-cell title="打卡状态" :value="isInRange ? '在有效范围内' : '不在有效范围内'" />
          <van-cell v-if="selectedTask.type === 'range'" title="打卡范围" :value="`${checkinRange}米`" />
        </div>
        
        <div style="margin: 16px">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="!isInRange"
          >
            {{ isInRange ? '打卡' : '不在打卡范围内' }}
          </van-button>
        </div>
      </van-form>
      
      <!-- 任务选择弹窗 -->
      <van-popup
        v-model:show="showTaskPicker"
        position="bottom"
        :style="{ height: '40%' }"
      >
        <van-picker
          :columns="availableTasks"
          @confirm="onTaskSelect"
          @cancel="showTaskPicker = false"
          :title="'选择打卡任务'"
          show-toolbar
        />
      </van-popup>
      
      <!-- 地点选择弹窗 -->
      <van-popup
        v-model:show="showLocationPicker"
        position="bottom"
        :style="{ height: '40%' }"
      >
        <van-picker
          :columns="availableLocations"
          @confirm="onLocationSelect"
          @cancel="showLocationPicker = false"
          :title="'选择打卡地点'"
          show-toolbar
        />
      </van-popup>
    </template>
    
    <!-- PC端界面 -->
    <template v-else>
      <el-card class="checkin-form">
        <template #header>
          <div class="card-header">
            <span>打卡信息</span>
          </div>
        </template>
        
        <el-form
          ref="formRef"
          :model="checkinData"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleCheckin"
        >
          <el-form-item label="打卡任务" prop="task">
            <el-select
              v-model="selectedTask"
              placeholder="请选择打卡任务"
              style="width: 100%"
            >
              <el-option
                v-for="task in availableTasks"
                :key="task.id"
                :label="task.name"
                :value="task"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item v-if="selectedTask.type === 'location'" label="打卡地点" prop="location_name">
            <el-select
              v-model="checkinData.location_name"
              placeholder="请选择打卡地点"
              style="width: 100%"
            >
              <el-option
                v-for="location in availableLocations"
                :key="location.value"
                :label="location.text"
                :value="location.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="当前位置">
            <el-input v-model="currentAddress" readonly />
          </el-form-item>
          
          <el-form-item label="打卡状态">
            <el-tag :type="isInRange ? 'success' : 'danger'">
              {{ isInRange ? '在有效范围内' : '不在有效范围内' }}
            </el-tag>
          </el-form-item>
          
          <el-form-item v-if="selectedTask.type === 'range'" label="打卡范围">
            <el-input :value="`${checkinRange}米`" readonly />
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="checkinData.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入打卡备注"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleCheckin"
              :loading="loading"
              :disabled="!isInRange"
              style="width: 100%"
            >
              {{ isInRange ? '打卡' : '不在打卡范围内' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useCheckinStore } from '../stores/checkin'
import { showToast, showSuccessToast } from 'vant'
import { ElMessage } from 'element-plus'
import MapService from '../utils/map'

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 状态管理
const checkinStore = useCheckinStore()

// 响应式数据
const mapContainer = ref(null)
const loading = ref(false)
const currentAddress = ref('')
const isInRange = ref(false)
const showTaskPicker = ref(false)
const showLocationPicker = ref(false)
const checkinRange = ref(100) // 默认打卡范围100米

const selectedTask = ref({
  id: '',
  name: '',
  type: '', // 'range' 或 'location'
  target: null // 目标位置或区域
})

const checkinData = ref({
  task_id: '',
  location_name: '',
  remarks: '',
  location: null,
  timestamp: null
})

// 表单验证规则（PC端）
const rules = {
  task: [{ required: true, message: '请选择打卡任务', trigger: 'change' }],
  location_name: [{ required: true, message: '请选择打卡地点', trigger: 'change' }]
}

// 可选打卡地点（示例数据）
const availableLocations = [
  { text: '东城区商圈', value: 'dongcheng' },
  { text: '西城区商圈', value: 'xicheng' },
  { text: '朝阳区商圈', value: 'chaoyang' }
]

// 可选打卡任务（示例数据，实际应从后端获取）
const availableTasks = [
  {
    id: '1',
    name: '总部打卡',
    type: 'range',
    target: [116.397428, 39.90923]
  },
  {
    id: '2',
    name: '商圈巡检',
    type: 'location',
    target: null
  }
]

// 监听任务选择变化
watch(selectedTask, (newTask) => {
  if (!newTask.id) return
  
  checkinData.value.task_id = newTask.id
  updateCheckinStatus()
})

// 初始化地图
onMounted(async () => {
  try {
    const map = await MapService.initMap(mapContainer.value)
    const location = await MapService.getCurrentLocation()
    
    checkinData.value.location = location.position
    currentAddress.value = location.formattedAddress
    
    // 在地图上显示当前位置
    MapService.showCurrentLocation(map, location.position)
    
    // 显示所有可打卡区域
    availableLocations.forEach(loc => {
      const demoCoords = {
        dongcheng: [116.418757, 39.917544],
        xicheng: [116.366794, 39.915309],
        chaoyang: [116.486409, 39.921489]
      }
      
      MapService.showLocationArea(map, demoCoords[loc.value])
    })
  } catch (error) {
    const message = '获取位置信息失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  }
})

// 更新打卡状态
const updateCheckinStatus = () => {
  if (!selectedTask.value.id || !checkinData.value.location) return
  
  if (selectedTask.value.type === 'range') {
    // 范围打卡检查
    const distance = MapService.calculateDistance(
      checkinData.value.location,
      selectedTask.value.target
    )
    isInRange.value = distance <= checkinRange.value
  } else {
    // 位置打卡检查
    const locationCoords = {
      dongcheng: [116.418757, 39.917544],
      xicheng: [116.366794, 39.915309],
      chaoyang: [116.486409, 39.921489]
    }
    
    if (checkinData.value.location_name) {
      const distance = MapService.calculateDistance(
        checkinData.value.location,
        locationCoords[checkinData.value.location_name]
      )
      isInRange.value = distance <= 200 // 位置打卡默认200米范围
    } else {
      isInRange.value = false
    }
  }
}

// 选择任务
const onTaskSelect = (task) => {
  selectedTask.value = task
  showTaskPicker.value = false
  updateCheckinStatus()
}

// 选择打卡地点
const onLocationSelect = (location) => {
  checkinData.value.location_name = location.value
  showLocationPicker.value = false
  updateCheckinStatus()
}

// 提交打卡
const handleCheckin = async () => {
  if (!isInRange.value) {
    const message = '不在打卡范围内'
    isMobile.value ? showToast(message) : ElMessage.warning(message)
    return
  }
  
  loading.value = true
  checkinData.value.timestamp = new Date().toISOString()
  
  try {
    await checkinStore.submitCheckin(checkinData.value)
    const message = '打卡成功'
    isMobile.value ? showSuccessToast(message) : ElMessage.success(message)
    checkinData.value.remarks = ''
  } catch (error) {
    const message = '打卡失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.checkin-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .map-container {
    height: 50%;
    width: 100%;
    margin-bottom: 16px;
  }
  
  .location-info {
    margin: 16px 0;
  }
  
  .checkin-form {
    margin: 16px;
    flex: 1;
  }
  
  :deep(.el-card__header) {
    padding: 12px 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>