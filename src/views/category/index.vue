<template>
  <div class="app-container">
    <!-- Search -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="名称：" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="分类名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Toolbar -->
    <el-card shadow="never" class="table-container">
      <template #header>
        <div class="flex justify-between">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="categoryList" border>
        <el-table-column label="分类名称" prop="name" align="center" />
        <el-table-column label="排序" prop="sort" align="center" />
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

    <!-- Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px">
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="dialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, toRefs } from "vue";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { Search, Plus, Edit, Delete, Refresh } from "@element-plus/icons-vue";
// Ensure icons are correctly imported for usage in template
import CategoryAPI, { CategoryQuery, CategoryForm, CategoryVO } from "@/api/category-api";

const queryFormRef = ref<FormInstance>();
const dataFormRef = ref<FormInstance>();

const state = reactive({
  loading: false,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  } as CategoryQuery,
  categoryList: [] as CategoryVO[],
  total: 0,
  dialog: {
    visible: false,
    title: "",
  },
  formData: {
    sort: 0,
  } as CategoryForm,
  rules: {
    name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  },
});

const { loading, queryParams, categoryList, total, dialog, formData, rules } = toRefs(state);

function handleQuery() {
  state.loading = true;
  CategoryAPI.getPage(state.queryParams)
    .then((response: any) => {
      // Adapt to ABP response structure
      const list = response.items || response.list || [];
      state.categoryList = list.map((item: any) => ({
        ...item,
        // Handle sort field naming differences if any (sortOrder vs sort)
        sort: item.sortOrder ?? item.sort,
      }));
      state.total = response.totalCount || response.total || 0;
      state.loading = false;
    })
    .catch(() => {
      state.loading = false;
    });
}

function handleReset() {
  queryFormRef.value?.resetFields();
  state.queryParams.pageNum = 1;
  handleQuery();
}

function handleAdd() {
  state.dialog.visible = true;
  state.dialog.title = "新增分类";
  state.formData = { sort: 0 };
  // Reset form validation
  if (dataFormRef.value) {
    dataFormRef.value.resetFields();
  }
}

function handleEdit(row: any) {
  state.dialog.visible = true;
  state.dialog.title = "修改分类";
  if (row.id) {
    CategoryAPI.getFormData(row.id).then((data) => {
      state.formData = data;
    });
  }
}

function handleDelete(row: any) {
  const ids = row.id;
  ElMessageBox.confirm("是否确认删除?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    CategoryAPI.deleteByIds(ids.toString()).then(() => {
      ElMessage.success("删除成功");
      handleQuery();
    });
  });
}

function submitForm() {
  dataFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (state.formData.id) {
        CategoryAPI.update(state.formData.id, state.formData).then(() => {
          ElMessage.success("修改成功");
          state.dialog.visible = false;
          handleQuery();
        });
      } else {
        CategoryAPI.add(state.formData).then(() => {
          ElMessage.success("新增成功");
          state.dialog.visible = false;
          handleQuery();
        });
      }
    }
  });
}

onMounted(() => {
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
