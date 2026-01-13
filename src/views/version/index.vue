<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>版本列表</span>
        </div>
      </template>
      <el-table :data="versionList" style="width: 100%">
        <el-table-column prop="version" label="版本号" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="content" label="更新内容" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const versionList = ref([
  {
    version: "v1.0.0",
    updateTime: "2023-10-01",
    content: "系统初始化",
  },
]);
</script>
