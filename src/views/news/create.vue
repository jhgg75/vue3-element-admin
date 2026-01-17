<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ formData.id ? "修改新闻" : "新增新闻" }}</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入新闻标题" style="width: 100%" />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="formData.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="封面" prop="coverUrl">
          <SingleImageUpload v-model="formData.coverUrl" />
        </el-form-item>

        <el-form-item label="内容" prop="contentHtml">
          <WangEditor v-model="formData.contentHtml" height="400px" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="0">草稿</el-radio>
            <el-radio :value="1">发布</el-radio>
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
import { useRoute, useRouter } from "vue-router";
import { ref, reactive, onMounted } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import WangEditor from "@/components/WangEditor/index.vue";
import SingleImageUpload from "@/components/Upload/SingleImageUpload.vue";
import CategoryAPI, { CategoryVO } from "@/api/category-api";
import NewsAPI, { NewsForm } from "@/api/news-api";

const router = useRouter();
const route = useRoute();
const formRef = ref<FormInstance>();

const categoryList = ref<CategoryVO[]>([]);

const formData = reactive<NewsForm>({
  id: undefined,
  title: "",
  categoryId: undefined as unknown as number,
  coverUrl: "",
  contentHtml: "",
  status: 0,
});

const rules = reactive<FormRules>({
  title: [{ required: true, message: "请输入新闻标题", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  coverUrl: [{ required: true, message: "请上传封面", trigger: "change" }],
  contentHtml: [{ required: true, message: "请输入新闻内容", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
});

function handleBack() {
  router.back();
}

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      const api = formData.id ? NewsAPI.update(formData.id, formData) : NewsAPI.add(formData);
      api
        .then(() => {
          ElMessage.success("保存成功");
          handleBack();
        })
        .catch((error) => {
          console.error("保存失败:", error);
        });
    } else {
      ElMessage.warning("请检查表单填写是否完整");
    }
  });
}

onMounted(async () => {
  // Load categories
  try {
    const categoryData = await CategoryAPI.getPage({ pageNum: 1, pageSize: 100 });
    categoryList.value = categoryData.items || categoryData.list || [];
  } catch (error) {
    console.error("加载分类失败:", error);
  }

  // Load news detail if id exists
  const id = route.query.id as string;
  // 如果是新增，id 为 undefined，不会进入 if 逻辑
  // 如果是修改，id 有值，进入 if 逻辑加载数据
  if (id) {
    NewsAPI.getFormData(id).then((data: any) => {
      // 兼容后端可能返回 PascalCase 或 camelCase 的情况
      formData.id = data.id || data.Id;
      formData.title = data.title || data.Title;

      const categoryId = data.categoryId || data.CategoryId;
      // 尝试匹配本地分类列表，确保类型一致 (字符串或数字)
      // 使用 loose equality (==) 来匹配 string "1" 和 number 1
      const matchedCategory = categoryList.value.find((c) => c.id == categoryId);
      if (matchedCategory) {
        formData.categoryId = matchedCategory.id;
      } else {
        formData.categoryId = categoryId;
      }

      // 优先使用 coverUrl，如果没有则尝试使用 cover (兼容旧数据)
      formData.coverUrl = data.coverUrl || data.CoverUrl;
      formData.contentHtml = data.contentHtml || data.ContentHtml;
      // 状态处理：注意 0 是 falsy 值，不能直接用 ||
      const status = data.status ?? data.Status;
      formData.status = status !== undefined ? status : 0;
    });
  }
});
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
