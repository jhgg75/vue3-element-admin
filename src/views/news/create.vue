<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>新增新闻</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入新闻标题" style="width: 100%" />
        </el-form-item>

        <el-form-item label="封面" prop="cover">
          <SingleImageUpload v-model="formData.cover" />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <WangEditor v-model="formData.content" height="400px" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import WangEditor from "@/components/WangEditor/index.vue";
import SingleImageUpload from "@/components/Upload/SingleImageUpload.vue";

const router = useRouter();
const formRef = ref<FormInstance>();

const formData = reactive({
  title: "",
  cover: "",
  content: "",
  status: "draft",
});

const rules = reactive<FormRules>({
  title: [{ required: true, message: "请输入新闻标题", trigger: "blur" }],
  cover: [{ required: true, message: "请上传封面", trigger: "change" }],
  content: [{ required: true, message: "请输入新闻内容", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
});

function handleBack() {
  router.back();
}

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      console.log("submit!", formData);
      ElMessage.success("保存成功");
      handleBack();
    }
  });
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
