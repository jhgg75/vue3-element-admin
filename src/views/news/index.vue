<template>
  <div class="app-container">
    <el-card shadow="never" class="search-container">
      <el-form ref="queryFormRef" :inline="true" :model="queryParams">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入标题"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 200px"
            @change="handleQuery"
          >
            <el-option label="已发布" :value="1" />
            <el-option label="草稿" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="queryParams.categoryId"
            placeholder="请选择分类"
            clearable
            filterable
            style="width: 200px"
            @change="handleQuery"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-container">
      <template #header>
        <div class="flex justify-between">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="newsList" border>
        <el-table-column label="标题" align="center" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column label="封面" align="center" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.coverUrl"
              :src="getCoverUrl(scope.row.coverUrl)"
              style="width: 50px; height: 50px"
              :preview-src-list="[getCoverUrl(scope.row.coverUrl)]"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column label="分类" align="center" width="120">
          <template #default="scope">
            {{ scope.row.categoryName }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1 || scope.row.Status === 1" type="success">
              已发布
            </el-tag>
            <el-tag v-else type="info">草稿</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" align="center" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.publishedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.creationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.lastModificationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="150">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">
              修改
            </el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, toRefs } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { Search, Plus, Edit, Delete, Refresh } from "@element-plus/icons-vue";
import NewsAPI, { type NewsQuery, type NewsVO } from "@/api/news-api";
import CategoryAPI, { type CategoryVO } from "@/api/category-api";

const router = useRouter();
const queryFormRef = ref<FormInstance>();

const state = reactive({
  loading: false,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: "",
    status: undefined,
    categoryId: undefined,
  } as NewsQuery,
  newsList: [] as NewsVO[],
  categoryList: [] as CategoryVO[],
  total: 0,
});

const { loading, queryParams, newsList, categoryList, total } = toRefs(state);

function handleQuery() {
  state.loading = true;
  NewsAPI.getPage(state.queryParams)
    .then((response: any) => {
      const list = response.items || response.list || [];
      state.newsList = list;
      state.total = response.totalCount || response.total || 0;
      state.loading = false;
    })
    .catch(() => {
      state.loading = false;
    });
}

function getCategoryList() {
  CategoryAPI.getPage({ pageNum: 1, pageSize: 100 }).then((response: any) => {
    state.categoryList = response.items || response.list || [];
  });
}

function handleReset() {
  queryFormRef.value?.resetFields();
  state.queryParams.pageNum = 1;
  state.queryParams.categoryId = undefined;
  handleQuery();
}

function handleAdd() {
  router.push("/news/create");
}

function handleEdit(row: any) {
  const id = row.id || row.Id;
  router.push({ path: "/news/create", query: { id } });
}

function handleDelete(row: any) {
  const ids = row.id || row.Id;
  ElMessageBox.confirm("是否确认删除?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    // center: true,
  }).then(() => {
    NewsAPI.deleteByIds(ids.toString()).then(() => {
      ElMessage.success("删除成功");
      handleQuery();
    });
  });
}

function formatTime(time: string) {
  if (!time) return "";
  return time.replace("T", " ").substring(0, 19);
}

const ossDomain = import.meta.env.VITE_OSS_DOMAIN || "";

function getCoverUrl(coverUrl: string) {
  if (!coverUrl) return "";
  if (coverUrl.startsWith("http://") || coverUrl.startsWith("https://")) {
    return coverUrl;
  }
  return ossDomain + coverUrl;
}

onMounted(() => {
  getCategoryList();
  handleQuery();
});
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
