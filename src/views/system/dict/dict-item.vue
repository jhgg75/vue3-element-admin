<!-- 字典项 -->
<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="字典标签/字典值"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">新增</el-button>
          <el-button
            type="danger"
            :disabled="ids.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            删除
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        highlight-current-row
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="字典项编码" prop="code" />
        <el-table-column label="字典项标签" prop="label" />
        <el-table-column label="字典项值" prop="value" />
        <el-table-column label="排序" prop="sortOrder" />
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.isEnabled ? 'success' : 'info'">
              {{ scope.row.isEnabled ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" align="center" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!--字典项弹窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-form-item label="字典项编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入字典项编码" />
        </el-form-item>
        <el-form-item label="字典项标签" prop="label">
          <el-input v-model="formData.label" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典项值" prop="value">
          <el-input v-model="formData.value" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="状态" prop="isEnabled">
          <el-switch v-model="formData.isEnabled" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" controls-position="right" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitClick">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import DictAPI, { DictItemPageQuery, DictItemPageVO, DictItemForm } from "@/api/system/dict-api";

const route = useRoute();

const dictionaryId = ref(route.query.dictionaryId as string);

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictItemPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref<DictItemPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictItemForm>({
  dictionaryId: dictionaryId.value,
  code: "",
  label: "",
  value: "",
  sortOrder: 1,
  isEnabled: true,
});

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    code: [{ required: true, message: "请输入字典项编码", trigger: "blur" }],
    value: [{ required: true, message: "请输入字典值", trigger: "blur" }],
    label: [{ required: true, message: "请输入字典标签", trigger: "blur" }],
  };

  return rules;
});

// 获取数据
function fetchData() {
  loading.value = true;
  DictAPI.getDictItemPage(dictionaryId.value, queryParams)
    .then((data) => {
      tableData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 查询（重置页码后获取数据）
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

// 行选择
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

// 打开弹窗
function handleOpenDialog(row?: DictItemPageVO) {
  dialog.visible = true;
  dialog.title = row ? "编辑字典项" : "新增字典项";

  if (row?.id) {
    DictAPI.getDictItemFormData(dictionaryId.value, row.id).then((data) => {
      Object.assign(formData, data);
    });
  }
}

// 提交表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;

      formData.dictionaryId = dictionaryId.value;
      if (id) {
        DictAPI.updateDictItem(dictionaryId.value, id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictAPI.createDictItem(dictionaryId.value, formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 关闭弹窗
function handleCloseDialog() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
  formData.sortOrder = 1;
  formData.isEnabled = true;
  formData.code = "";
  formData.label = "";
  formData.value = "";

  dialog.visible = false;
}
/**
 * 删除字典
 *
 * @param id 字典ID
 */
function handleDelete(id?: number) {
  const itemIds = [id || ids.value].join(",");

  if (!itemIds) {
    ElMessage.warning("请勾选删除项");

    return;
  }
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteDictItems(dictionaryId.value, itemIds).then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
