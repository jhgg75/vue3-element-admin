<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 用户列表 -->
      <el-col :lg="showDeptTree ? 20 : 24" :xs="24">
        <!-- 搜索区域 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="80px">
            <el-form-item label="用户名" prop="userName">
              <el-input
                v-model="queryParams.userName"
                placeholder="用户名"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="昵称" prop="name">
              <el-input
                v-model="queryParams.name"
                placeholder="昵称"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="queryParams.email"
                placeholder="邮箱"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="手机号码" prop="phoneNumber">
              <el-input
                v-model="queryParams.phoneNumber"
                placeholder="手机号码"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="全部"
                clearable
                style="width: 100px"
              >
                <el-option label="正常" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间">
              <el-date-picker
                v-model="queryParams.createTime"
                :editable="false"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item class="search-buttons">
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
              <el-button type="success" icon="plus" @click="handleOpenDialog()">新增</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="hover" class="data-table">
          <div class="data-table__toolbar">
            <div class="data-table__toolbar--actions">
              <el-button
                v-hasPerm="['sys:user:add']"
                type="success"
                icon="plus"
                @click="handleOpenDialog()"
              >
                新增
              </el-button>
              <el-button
                v-hasPerm="['sys:user:add']"
                type="primary"
                icon="plus"
                @click="handleOpenDialog()"
              >
                新增用户
              </el-button>
              <el-button
                v-hasPerm="'sys:user:delete'"
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                删除
              </el-button>
            </div>
            <div class="data-table__toolbar--tools">
              <el-button
                v-hasPerm="'sys:user:import'"
                icon="upload"
                @click="handleOpenImportDialog"
              >
                导入
              </el-button>

              <el-button v-hasPerm="'sys:user:export'" icon="download" @click="handleExport">
                导出
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="pageData"
            border
            stripe
            highlight-current-row
            class="data-table__content"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="头像" width="80" align="center">
              <template #default="scope">
                <el-avatar :src="scope.row.avatar" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="用户名" prop="username" />
            <el-table-column label="昵称" width="150" align="center" prop="nickname" />
            <el-table-column label="角色" align="center" min-width="160">
              <template #default="scope">
                <span v-if="Array.isArray(scope.row.roles)">
                  {{ scope.row.roles.join("，") }}
                </span>
                <span v-else>
                  {{ scope.row.roleNames }}
                </span>
              </template>
            </el-table-column>
            <!-- <el-table-column label="性别" width="100" align="center">
              <template #default="scope">
                <DictLabel v-model="scope.row.gender" code="gender" />
              </template>
            </el-table-column> -->
            <!-- <el-table-column label="部门" width="120" align="center" prop="deptName" /> -->
            <el-table-column label="手机号码" align="center" prop="mobile" width="120" />
            <el-table-column label="邮箱" align="center" prop="email" width="160" />
            <el-table-column label="状态" align="center" prop="isActive" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.isActive ? 'success' : 'info'">
                  {{ scope.row.isActive ? "启用" : "禁用" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              prop="createTime"
              align="center"
              width="180"
              sortable="custom"
            >
              <template #default="scope">
                {{ useDateFormat(scope.row.createTime, "YYYY-MM-DD HH:mm:ss").value }}
              </template>
            </el-table-column>
            <OperationColumn :list-data-length="pageData?.length || 0">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="hancleResetPassword(row)">
                  重置密码
                </el-button>
                <el-button link type="primary" size="small" @click="handleOpenDialog(row)">
                  编辑
                </el-button>
                <el-button link type="warning" size="small" @click="handleToggleActive(row)">
                  {{ row.isActive ? "禁用" : "启用" }}
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(row.id)">
                  删除
                </el-button>
              </template>
            </OperationColumn>
          </el-table>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="fetchData"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户表单 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :width="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="formData.mobile" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>

        <el-form-item label="状态" prop="isActive">
          <el-switch
            v-model="formData.isActive"
            inline-prompt
            active-text="启用"
            inactive-text="禁用"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入 -->
    <UserImport v-model="importDialogVisible" @import-success="handleQuery()" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app-store";
import { DeviceEnum } from "@/enums/settings/device-enum";
const route = useRoute();

import UserAPI, { UserForm, UserPageQuery, UserPageVO } from "@/api/system/user-api";
import RoleAPI from "@/api/system/role-api";

import UserImport from "./components/UserImport.vue";
import OperationColumn from "@/components/OperationColumn/index.vue";
import { useUserStore } from "@/store";
import { useDateFormat } from "@vueuse/core";
const userStore = useUserStore();
defineOptions({
  name: "User",
  inheritAttrs: false,
});

const appStore = useAppStore();
const showDeptTree = computed(() => !route.meta?.hideDeptTree);

const queryFormRef = ref();
const userFormRef = ref();

const queryParams = reactive<UserPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<UserPageVO[]>();
const total = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: "新增用户",
});
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const formData = reactive<UserForm>({
  isActive: true,
});

const rules = reactive({
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  nickname: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  roleIds: [{ required: true, message: "用户角色不能为空", trigger: "blur" }],
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: "请输入正确的邮箱地址",
      trigger: "blur",
    },
  ],
  mobile: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
});

// 选中的用户ID
const selectIds = ref<number[]>([]);
// 角色下拉数据源
const roleOptions = ref<OptionType[]>();
// 导入弹窗显示状态
const importDialogVisible = ref(false);

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const data = await UserAPI.getPage(queryParams);
    pageData.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

// 查询（重置页码后获取数据）
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

function handleSortChange({
  prop,
  order,
}: {
  prop: string;
  order: "ascending" | "descending" | null;
}) {
  if (prop === "createTime" && order) {
    queryParams.sorting = `creationTime ${order === "ascending" ? "asc" : "desc"}`;
  } else {
    queryParams.sorting = undefined;
  }
  queryParams.pageNum = 1;
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  queryParams.createTime = undefined;
  fetchData();
}

// 选中项发生变化
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item) => item.id);
}

function hancleResetPassword(row: UserPageVO) {
  ElMessageBox.prompt("请输入用户【" + row.username + "】的新密码", "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  }).then(({ value }) => {
    if (!value || value.length < 6) {
      ElMessage.warning("密码至少需要6位字符，请重新输入");
      return false;
    }
    UserAPI.resetPassword(row.id, value).then(() => {
      ElMessage.success("密码重置成功，新密码是：" + value);
    });
  });
}

async function handleToggleActive(row: UserPageVO) {
  const targetIsActive = !row.isActive;
  const text = targetIsActive ? "启用" : "禁用";
  loading.value = true;
  try {
    await UserAPI.setActive(row.id, targetIsActive);
    ElMessage.success(text + "成功");
    row.isActive = targetIsActive;
    row.status = targetIsActive ? 1 : 0;
    await fetchData();
  } finally {
    loading.value = false;
  }
}

async function handleOpenDialog(row?: UserPageVO) {
  dialog.visible = true;

  if (row && row.id) {
    dialog.title = "编辑用户";
    Object.assign(formData, {
      id: row.id,
      username: row.username,
      nickname: row.nickname,
      mobile: row.mobile,
      email: row.email,
      isActive: row.isActive,
      status: row.status,
    });
  } else {
    dialog.title = "新增用户";
    Object.assign(formData, {
      id: undefined,
      username: "",
      nickname: "",
      mobile: "",
      email: "",
      deptId: undefined,
      roleIds: [],
      gender: undefined,
      isActive: true,
      status: 1,
      avatar: "",
    });
  }

  try {
    roleOptions.value = await RoleAPI.getOptions();
  } catch (error) {
    console.error("加载用户下拉数据源失败", error);
  }

  if (row && row.id) {
    try {
      const data = await UserAPI.getFormData(row.id);
      Object.assign(formData, { ...data });
    } catch (error) {
      console.error("获取用户表单详情失败", error);
    }
  }
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();

  formData.id = undefined;
  formData.isActive = true;
}

// 提交用户表单（防抖）
const handleSubmit = useDebounceFn(() => {
  userFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const userId = formData.id;
      loading.value = true;
      if (userId) {
        UserAPI.update(userId, formData)
          .then(() => {
            ElMessage.success("修改用户成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        UserAPI.create(formData)
          .then(() => {
            ElMessage.success("新增用户成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 1000);

/**
 * 检查是否删除当前登录用户
 * @param singleId 单个删除的用户ID
 * @param selectedIds 批量删除的用户ID数组
 * @param currentUserInfo 当前用户信息
 * @returns 是否包含当前用户
 */
function isDeletingCurrentUser(
  singleId?: number,
  selectedIds: number[] = [],
  currentUserInfo?: any
): boolean {
  if (!currentUserInfo?.userId) return false;

  // 单个删除检查
  if (singleId && singleId.toString() === currentUserInfo.userId) {
    return true;
  }

  // 批量删除检查
  if (!singleId && selectedIds.length > 0) {
    return selectedIds.map(String).includes(currentUserInfo.userId);
  }

  return false;
}

/**
 * 删除用户
 *
 * @param id  用户ID
 */
function handleDelete(id?: number) {
  const userIds = [id || selectIds.value].join(",");
  if (!userIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  // 安全检查：防止删除当前登录用户
  const currentUserInfo = userStore.userInfo;
  if (isDeletingCurrentUser(id, selectIds.value, currentUserInfo)) {
    ElMessage.error("不能删除当前登录用户");
    return;
  }

  ElMessageBox.confirm("确认删除用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    loading.value = true;
    UserAPI.deleteByIds(userIds)
      .then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      })
      .finally(() => (loading.value = false));
  });
}

// 打开导入弹窗
function handleOpenImportDialog() {
  importDialogVisible.value = true;
}

// 导出用户
function handleExport() {
  UserAPI.export(queryParams).then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(response.headers["content-disposition"].split(";")[1].split("=")[1]);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

onMounted(() => {
  handleQuery();
});
</script>
