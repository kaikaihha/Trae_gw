<template>
  <div class="admin-container">
    <!-- 移动端界面 -->
    <template v-if="isMobile">
      <van-tabs v-model:active="activeTab" sticky>
        <!-- 任务管理 -->
        <van-tab title="任务管理" name="tasks">
          <van-form>
            <van-cell-group inset>
              <van-field
                v-model="taskForm.title"
                name="title"
                label="任务标题"
                placeholder="请输入任务标题"
                :rules="[{ required: true, message: '请输入任务标题' }]"
              />
              <van-field
                v-model="taskForm.type"
                name="type"
                label="任务类型"
                placeholder="请选择任务类型"
                readonly
                @click="showTaskTypePicker = true"
                :rules="[{ required: true, message: '请选择任务类型' }]"
              />
              <van-field
                v-model="taskForm.department"
                name="department"
                label="执行部门"
                placeholder="请选择执行部门"
                readonly
                @click="showDepartmentPicker = true"
                :rules="[{ required: true, message: '请选择执行部门' }]"
              />
              <van-field
                v-model="taskForm.dateRange"
                name="dateRange"
                label="执行时间"
                readonly
                @click="showDatePicker = true"
                :rules="[{ required: true, message: '请选择执行时间' }]"
              />
            </van-cell-group>
            
            <div style="margin: 16px">
              <van-button round block type="primary" @click="handleTaskSubmit" :loading="loading">
                创建任务
              </van-button>
            </div>
          </van-form>
          
          <!-- 任务列表 -->
          <van-list
            v-model:loading="taskListLoading"
            :finished="taskListFinished"
            finished-text="没有更多了"
            @load="loadTaskList"
          >
            <van-cell-group inset v-for="task in taskList" :key="task.id">
              <van-cell :title="task.title" :label="task.type === 'daily' ? '日常任务' : '周任务'">
                <template #value>
                  <van-tag :type="task.status === 'active' ? 'success' : 'default'">
                    {{ task.status === 'active' ? '进行中' : '已结束' }}
                  </van-tag>
                </template>
              </van-cell>
            </van-cell-group>
          </van-list>
        </van-tab>
        
        <!-- 区域管理 -->
        <van-tab title="区域管理" name="areas">
          <div class="map-container" ref="mapContainer"></div>
          
          <van-form>
            <van-cell-group inset>
              <van-field
                v-model="areaForm.name"
                name="name"
                label="区域名称"
                placeholder="请输入区域名称"
                :rules="[{ required: true, message: '请输入区域名称' }]"
              />
              <van-field
                v-model="areaForm.type"
                name="type"
                label="区域类型"
                placeholder="请选择区域类型"
                readonly
                @click="showAreaTypePicker = true"
                :rules="[{ required: true, message: '请选择区域类型' }]"
              />
              <van-field
                v-model="areaForm.radius"
                name="radius"
                label="打卡范围(米)"
                type="number"
                placeholder="请输入打卡范围"
                :rules="[{ required: true, message: '请输入打卡范围' }]"
              />
            </van-cell-group>
            
            <div style="margin: 16px">
              <van-button round block type="primary" @click="handleAreaSubmit" :loading="loading">
                创建区域
              </van-button>
            </div>
          </van-form>
          
          <!-- 区域列表 -->
          <van-list
            v-model:loading="areaListLoading"
            :finished="areaListFinished"
            finished-text="没有更多了"
            @load="loadAreaList"
          >
            <van-cell-group inset v-for="area in areaList" :key="area.id">
              <van-cell :title="area.name" :label="`${area.radius}米范围`">
                <template #value>
                  <van-tag :type="area.status === 'active' ? 'success' : 'default'">
                    {{ area.status === 'active' ? '启用' : '禁用' }}
                  </van-tag>
                </template>
              </van-cell>
            </van-cell-group>
          </van-list>
        </van-tab>
        
        <!-- 记录查询 -->
        <van-tab title="记录查询" name="records">
          <van-form>
            <van-cell-group inset>
              <van-field
                v-model="recordFilter.dateRange"
                name="dateRange"
                label="日期范围"
                readonly
                @click="showRecordDatePicker = true"
              />
              <van-field
                v-model="recordFilter.department"
                name="department"
                label="部门"
                readonly
                @click="showRecordDepartmentPicker = true"
              />
            </van-cell-group>
            
            <div style="margin: 16px">
              <van-button round block type="primary" @click="handleExport" :loading="exporting">
                导出记录
              </van-button>
            </div>
          </van-form>
          
          <!-- 记录列表 -->
          <van-list
            v-model:loading="recordListLoading"
            :finished="recordListFinished"
            finished-text="没有更多了"
            @load="loadRecordList"
          >
            <van-cell-group inset v-for="record in recordList" :key="record.id">
              <van-cell
                :title="record.username"
                :label="`${record.department} - ${record.timestamp}`"
              >
                <template #value>
                  <van-tag :type="record.status === 'valid' ? 'success' : 'danger'">
                    {{ record.status === 'valid' ? '有效' : '无效' }}
                  </van-tag>
                </template>
              </van-cell>
            </van-cell-group>
          </van-list>
        </van-tab>
      </van-tabs>
      
      <!-- 选择器弹窗 -->
      <van-popup v-model:show="showTaskTypePicker" position="bottom">
        <van-picker
          :columns="taskTypes"
          @confirm="onTaskTypeSelect"
          @cancel="showTaskTypePicker = false"
          title="选择任务类型"
          show-toolbar
        />
      </van-popup>
      
      <van-popup v-model:show="showDepartmentPicker" position="bottom">
        <van-picker
          :columns="departmentOptions"
          @confirm="onDepartmentSelect"
          @cancel="showDepartmentPicker = false"
          title="选择部门"
          show-toolbar
        />
      </van-popup>
      
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
      
      <van-popup v-model:show="showAreaTypePicker" position="bottom">
        <van-picker
          :columns="areaTypes"
          @confirm="onAreaTypeSelect"
          @cancel="showAreaTypePicker = false"
          title="选择区域类型"
          show-toolbar
        />
      </van-popup>
    </template>
    
    <!-- PC端界面 -->
    <template v-else>
      <el-tabs v-model="activeTab" class="admin-tabs">
        <!-- 任务管理 -->
        <el-tab-pane label="任务管理" name="tasks">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="task-form-card">
                <template #header>
                  <div class="card-header">
                    <span>创建任务</span>
                  </div>
                </template>
                
                <el-form
                  ref="taskFormRef"
                  :model="taskForm"
                  :rules="taskRules"
                  label-position="top"
                >
                  <el-form-item label="任务标题" prop="title">
                    <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
                  </el-form-item>
                  
                  <el-form-item label="任务类型" prop="type">
                    <el-select v-model="taskForm.type" placeholder="请选择任务类型" style="width: 100%">
                      <el-option
                        v-for="type in taskTypes"
                        :key="type.value"
                        :label="type.text"
                        :value="type.value"
                      />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="执行部门" prop="department">
                    <el-select v-model="taskForm.department" placeholder="请选择执行部门" style="width: 100%">
                      <el-option
                        v-for="dept in departmentOptions"
                        :key="dept.value"
                        :label="dept.text"
                        :value="dept.value"
                      />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="执行时间" prop="dateRange">
                    <el-date-picker
                      v-model="taskForm.dateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="handleTaskSubmit" :loading="loading" style="width: 100%">
                      创建任务
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
            
            <el-col :span="16">
              <el-card class="task-list-card">
                <template #header>
                  <div class="card-header">
                    <span>任务列表</span>
                  </div>
                </template>
                
                <el-table :data="taskList" style="width: 100%">
                  <el-table-column prop="title" label="任务标题" />
                  <el-table-column prop="type" label="任务类型">
                    <template #default="{ row }">
                      {{ row.type === 'daily' ? '日常任务' : '周任务' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="department" label="执行部门" />
                  <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                      <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                        {{ row.status === 'active' ? '进行中' : '已结束' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button
                        :type="row.status === 'active' ? 'danger' : 'success'"
                        size="small"
                        @click="toggleTaskStatus(row)"
                      >
                        {{ row.status === 'active' ? '结束' : '激活' }}
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <!-- 区域管理 -->
        <el-tab-pane label="区域管理" name="areas">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="area-form-card">
                <template #header>
                  <div class="card-header">
                    <span>创建区域</span>
                  </div>
                </template>
                
                <div class="map-container" ref="mapContainer"></div>
                
                <el-form
                  ref="areaFormRef"
                  :model="areaForm"
                  :rules="areaRules"
                  label-position="top"
                >
                  <el-form-item label="区域名称" prop="name">
                    <el-input v-model="areaForm.name" placeholder="请输入区域名称" />
                  </el-form-item>
                  
                  <el-form-item label="区域类型" prop="type">
                    <el-select v-model="areaForm.type" placeholder="请选择区域类型" style="width: 100%">
                      <el-option
                        v-for="type in areaTypes"
                        :key="type.value"
                        :label="type.text"
                        :value="type.value"
                      />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="打卡范围(米)" prop="radius">
                    <el-input-number
                      v-model="areaForm.radius"
                      :min="50"
                      :max="1000"
                      style="width: 100%"
                    />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="handleAreaSubmit" :loading="loading" style="width: 100%">
                      创建区域
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
            
            <el-col :span="16">
              <el-card class="area-list-card">
                <template #header>
                  <div class="card-header">
                    <span>区域列表</span>
                  </div>
                </template>
                
                <el-table :data="areaList" style="width: 100%">
                  <el-table-column prop="name" label="区域名称" />
                  <el-table-column prop="type" label="区域类型" />
                  <el-table-column prop="radius" label="打卡范围">
                    <template #default="{ row }">
                      {{ row.radius }}米
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态">
                    <template #default="{ row }">
                      <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                        {{ row.status === 'active' ? '启用' : '禁用' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button
                        :type="row.status === 'active' ? 'danger' : 'success'"
                        size="small"
                        @click="toggleAreaStatus(row)"
                      >
                        {{ row.status === 'active' ? '禁用' : '启用' }}
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <!-- 记录查询 -->
        <el-tab-pane label="记录查询" name="records">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>走访记录</span>
                <el-button type="primary" @click="handleExport" :loading="exporting">
                  导出记录
                </el-button>
              </div>
            </template>
            
            <el-form :model="recordFilter" inline class="filter-form">
              <el-form-item label="日期范围">
                <el-date-picker
                  v-model="recordFilter.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              
              <el-form-item label="部门">
                <el-select v-model="recordFilter.department" placeholder="请选择部门">
                  <el-option
                    v-for="dept in departmentOptions"
                    :key="dept.value"
                    :label="dept.text"
                    :value="dept.value"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="loadRecordList">查询</el-button>
                <el-button @click="resetRecordFilter">重置</el-button>
              </el-form-item>
            </el-form>
            
            <el-table :data="recordList" style="width: 100%">
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="department" label="部门" />
              <el-table-column prop="timestamp" label="打卡时间" />
              <el-table-column prop="address" label="打卡地点" show-overflow-tooltip />
              <el-table-column prop="status" label="状态">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'valid' ? 'success' : 'danger'">
                    {{ row.status === 'valid' ? '有效' : '无效' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { ElMessage } from 'element-plus'
import MapService from '../utils/map'

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 响应式数据
const activeTab = ref('tasks')
const mapContainer = ref(null)
const loading = ref(false)
const exporting = ref(false)

// 任务相关数据
const taskForm = ref({
  title: '',
  type: '',
  department: '',
  dateRange: ''
})

const taskList = ref([])
const taskListLoading = ref(false)
const taskListFinished = ref(false)

// 区域相关数据
const areaForm = ref({
  name: '',
  type: '',
  radius: 100,
  location: null
})

const areaList = ref([])
const areaListLoading = ref(false)
const areaListFinished = ref(false)

// 记录查询相关数据
const recordFilter = ref({
  dateRange: '',
  department: ''
})

const recordList = ref([])
const recordListLoading = ref(false)
const recordListFinished = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 选择器相关
const showTaskTypePicker = ref(false)
const showDepartmentPicker = ref(false)
const showDatePicker = ref(false)
const showAreaTypePicker = ref(false)
const selectedDate = ref([])

// 日期范围限制
const minDate = new Date()
const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3))

// 选项数据
const taskTypes = [
  { text: '日常任务', value: 'daily' },
  { text: '周任务', value: 'weekly' }
]

const departmentOptions = [
  { text: '全部部门', value: '' },
  { text: '销售部', value: 'sales' },
  { text: '市场部', value: 'marketing' },
  { text: '客服部', value: 'service' }
]

const areaTypes = [
  { text: '商业区', value: 'business' },
  { text: '住宅区', value: 'residential' },
  { text: '工业区', value: 'industrial' }
]

// 表单验证规则
const taskRules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  department: [{ required: true, message: '请选择执行部门', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择执行时间', trigger: 'change' }]
}

const areaRules = {
  name: [{ required: true, message: '请输入区域名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择区域类型', trigger: 'change' }],
  radius: [{ required: true, message: '请输入打卡范围', trigger: 'blur' }]
}

// 初始化
onMounted(async () => {
  if (activeTab.value === 'areas') {
    try {
      const map = await MapService.initMap(mapContainer.value)
      const location = await MapService.getCurrentLocation()
      areaForm.value.location = location.position
      
      // 在地图上显示当前位置
      MapService.showCurrentLocation(map, location.position)
    } catch (error) {
      const message = '获取位置信息失败：' + error.message
      isMobile.value ? showToast(message) : ElMessage.error(message)
    }
  }
  
  loadTaskList()
  loadAreaList()
  loadRecordList()
})

// 任务相关方法
const handleTaskSubmit = async () => {
  loading.value = true
  try {
    // 实际项目中应该调用后端API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const message = '任务创建成功'
    isMobile.value ? showSuccessToast(message) : ElMessage.success(message)
    
    // 重置表单
    taskForm.value = {
      title: '',
      type: '',
      department: '',
      dateRange: ''
    }
    
    // 刷新任务列表
    loadTaskList()
  } catch (error) {
    const message = '创建失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

const loadTaskList = async () => {
  taskListLoading.value = true
  try {
    // 实际项目中应该调用后端API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    taskList.value = [
      {
        id: '1',
        title: '日常巡店任务',
        type: 'daily',
        department: '销售部',
        status: 'active'
      },
      {
        id: '2',
        title: '周度市场调研',
        type: 'weekly',
        department: '市场部',
        status: 'ended'
      }
    ]
    
    taskListFinished.value = true
  } catch (error) {
    const message = '加载失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    taskListLoading.value = false
  }
}

const toggleTaskStatus = async (task) => {
  try {
    // 实际项目中应该调用后端API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    task.status = task.status === 'active' ? 'ended' : 'active'
    const message = `任务${task.status === 'active' ? '激活' : '结束'}成功`
    isMobile.value ? showSuccessToast(message) : ElMessage.success(message)
  } catch (error) {
    const message = '操作失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  }
}

// 区域相关方法
const handleAreaSubmit = async () => {
  if (!areaForm.value.location) {
    const message = '请先在地图上选择位置'
    isMobile.value ? showToast(message) : ElMessage.warning(message)
    return
  }
  
  loading.value = true
  try {
    // 实际项目中应该调用后端API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const message = '区域创建成功'
    isMobile.value ? showSuccessToast(message) : ElMessage.success(message)
    
    // 重置表单
    areaForm.value = {
      name: '',
      type: '',
      radius: 100,
      location: areaForm.value.location
    }
    
    // 刷新区域列表
    loadAreaList()
  } catch (error) {
    const message = '创建失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

const loadAreaList = async () => {
  areaListLoading.value = true
  try {
    // 实际项目中应该调用后端API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    areaList.value = [
      {
        id: '1',
        name: '东城商圈',
        type: 'business',
        radius: 100,
        status: 'active'
      },
      {
        id: '2',
        name: '西城居民区',
        type: 'residential',
        radius: 200,
        status: 'inactive'
      }
    ]
    
    areaListFinished.value = true
  } catch (error) {
    const message = '加载失败：' + error.message
    isMobile.value ? showToast(message) : ElMessage.error(message)
  } finally {
    areaListLoading.value = false
  }
}