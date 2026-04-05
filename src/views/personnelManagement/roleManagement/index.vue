<template>
  <div class="roleManagement-container">
    <vab-page-header description="系统角色权限管理，支持角色的增删改查操作" :icon="['fas', 'user-shield']" title="角色管理" />
    <el-divider content-position="left">
      演示环境仅做基础功能展示，若想实现不同角色的真实菜单配置，需将settings.js路由加载模式改为all模式，由后端全面接管路由渲染与权限控制
    </el-divider>

    <crud-toolbar
      :model="queryForm"
      :query-fields="queryFields"
      show-batch-delete
      show-create
      @batch-delete="handleDelete"
      @create="handleEdit"
      @reset="resetQuery"
      @search="queryData"
    />

    <el-table v-loading="listLoading" :data="list" :element-loading-text="elementLoadingText" @selection-change="setSelectRows">
      <el-table-column show-overflow-tooltip type="selection" />
      <schema-table-columns :columns="tableColumns" />
      <el-table-column label="操作" show-overflow-tooltip width="200">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      :current-page="queryForm.pageNo"
      :layout="layout"
      :page-size="queryForm.pageSize"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />

    <edit ref="editRef" @fetch-data="fetchData" />
  </div>
</template>

<script>
import { useCrudPage } from "@/composables/useCrudPage";
import { doDelete, getList } from "@/api/roleManagement";
import Edit from "./components/RoleManagementEdit.vue";
import CrudToolbar from "@/components/CrudToolbar.vue";
import SchemaTableColumns from "@/components/SchemaTableColumns.vue";
import VabPageHeader from "@/components/VabPageHeader";

export default {
  name: "RoleManagement",
  components: {
    Edit,
    CrudToolbar,
    SchemaTableColumns,
    VabPageHeader,
  },
  setup() {
    const queryFields = [{ prop: "permission", placeholder: "请输入查询条件" }];
    const tableColumns = [
      { label: "id", prop: "id" },
      { label: "权限码", prop: "permission" },
    ];
    const crud = useCrudPage({
      initialQueryForm: {
        pageNo: 1,
        pageSize: 10,
        permission: "",
      },
      fetchFn: getList,
      deleteFn: doDelete,
      fetchErrorMessage: "角色列表加载失败，请检查后端接口是否已启动",
      deleteConfirmMessage: "你确定要删除当前项吗",
    });

    return {
      ...crud,
      queryFields,
      tableColumns,
    };
  },
};
</script>
