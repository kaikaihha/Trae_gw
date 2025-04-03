<template>
  <div class="info-list-container">
    <!-- 移动端界面 -->
    <template v-if="isMobile">
      <van-search
        v-model="searchQuery"
        placeholder="搜索商铺名称"
        @search="handleSearch"
      />
      
      <van-button
        type="primary"
        block
        style="margin: 16px"
        @click="handleAdd"
      >
        新增商铺信息
      </van-button>
      
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadList"
      >
        <van-cell-group inset v-for="item in infoList" :key="item.id">
          <van-cell :title="item.shop_name" :label="item.address">
            <template #value>
              <van-button
                size="small"
                type="primary"
                @click="handleEdit(item.id)"
              >
                编辑
              </van-button>
            </template>
          </van-cell>
          <van-cell :title="'联系人：' + item.contact" :label="'电话：' + item.phone" />
        </van-cell-group>
      </van-list>
    </template>
    
    <!-- PC端界面 -->
    <template v-else>
      <el-card>
        <template #header>
          <div class="card-header">
            <span>商铺信息列表</span>
            <el-button type="primary" @click="handleAdd">新增商铺信息</el-button>
          </div>
        </template>
        
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商铺名称"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        
        <el-table :data="infoList" style="width: 100%">
          <el-table-column prop="shop_name" label="商铺名称" />
          <el-table-column prop="contact" label="联系人" />
          <el-table-column prop="phone" label="联系电话" />
          <el-table-column prop="address" label="商铺地址" show-overflow-tooltip />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleEdit(row.id)"
              >
                编辑
              </el-button>
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckinStore } from '../stores/checkin'

// 响应式布局
const isMobile = computed(() => window.innerWidth <= 768)

// 路由
const router = useRouter()

// Store
const checkinStore = useCheckinStore()

// 响应式数据
const searchQuery = ref('')
const loading = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const infoList = ref([])

// 加载列表数据
const loadList = async () => {
  loading.value = true
  try {
    const allForms = checkinStore.infoForms
    const filteredForms = searchQuery.value
      ? allForms.filter(form =>
          form.shop_name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      : allForms
    
    total.value = filteredForms.length
    
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    infoList.value = filteredForms.slice(start, end)
    
    finished.value = end >= filteredForms.length
  } catch (error) {
    console.error('加载列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadList()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  loadList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadList()
}

// 新增商铺信息
const handleAdd = () => {
  router.push('/info-form')
}

// 编辑商铺信息
const handleEdit = (id) => {
  router.push(`/info-form/${id}`)
}

// 初始化加载
loadList()
</script>

<style scoped>
.info-list-container {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>