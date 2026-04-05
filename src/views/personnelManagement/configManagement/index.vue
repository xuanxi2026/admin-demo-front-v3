<template>
  <div class="configManagement-container">
    <vab-page-header description="系统配置管理，沉淀可跨项目复用的站点、安全和存储开关" :icon="['fas', 'sliders-h']" title="系统配置" />

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
      <el-table-column label="操作" show-overflow-tooltip width="180">
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
import { doDelete, getList } from "@/api/configManagement";
import Edit from "./components/ConfigManagementEdit.vue";
import CrudToolbar from "@/components/CrudToolbar.vue";
import SchemaTableColumns from "@/components/SchemaTableColumns.vue";
import VabPageHeader from "@/components/VabPageHeader";

export default {
  name: "ConfigManagement",
  components: {
    Edit,
    CrudToolbar,
    SchemaTableColumns,
    VabPageHeader,
  },
  setup() {
    const queryFields = [
      { prop: "group", placeholder: "配置分组", width: 160 },
      { prop: "keyword", placeholder: "配置键/名称/分组", width: 240 },
    ];
    const tableColumns = [
      { label: "ID", prop: "id", width: 80 },
      { label: "配置键", prop: "configKey", minWidth: 180 },
      { label: "配置名称", prop: "name", minWidth: 140 },
      { label: "分组", prop: "group", width: 120 },
      { label: "值类型", prop: "valueType", width: 110 },
      { label: "配置值", prop: "configValue", minWidth: 180 },
      { label: "备注", prop: "remark", minWidth: 180 },
      { label: "修改时间", prop: "datatime", minWidth: 160 },
    ];
    const crud = useCrudPage({
      initialQueryForm: {
        pageNo: 1,
        pageSize: 10,
        group: "",
        keyword: "",
      },
      fetchFn: getList,
      deleteFn: doDelete,
      fetchErrorMessage: "系统配置加载失败，请检查后端接口是否已启动",
    });

    return {
      ...crud,
      queryFields,
      tableColumns,
    };
  },
};
</script>
