<template>
  <div class="dictManagement-container">
    <vab-page-header description="系统字典管理，沉淀跨项目复用的状态、枚举和值域配置" :icon="['fas', 'book']" title="字典管理" />

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
import { doDelete, getList } from "@/api/dictManagement";
import Edit from "./components/DictManagementEdit.vue";
import CrudToolbar from "@/components/CrudToolbar.vue";
import SchemaTableColumns from "@/components/SchemaTableColumns.vue";
import VabPageHeader from "@/components/VabPageHeader";

export default {
  name: "DictManagement",
  components: {
    Edit,
    CrudToolbar,
    SchemaTableColumns,
    VabPageHeader,
  },
  setup() {
    const queryFields = [
      { prop: "dictType", placeholder: "字典类型", width: 160 },
      { prop: "keyword", placeholder: "标签/值/类型", width: 220 },
    ];
    const tableColumns = [
      { label: "ID", prop: "id", width: 80 },
      { label: "字典类型", prop: "dictType", minWidth: 140 },
      { label: "标签", prop: "label", minWidth: 120 },
      { label: "值", prop: "value", minWidth: 120 },
      { label: "状态", prop: "status", width: 100 },
      { label: "排序", prop: "sort", width: 90 },
      { label: "备注", prop: "remark", minWidth: 180 },
      { label: "修改时间", prop: "datatime", minWidth: 160 },
    ];
    const crud = useCrudPage({
      initialQueryForm: {
        pageNo: 1,
        pageSize: 10,
        dictType: "",
        keyword: "",
      },
      fetchFn: getList,
      deleteFn: doDelete,
      fetchErrorMessage: "字典列表加载失败，请检查后端接口是否已启动",
    });

    return {
      ...crud,
      queryFields,
      tableColumns,
    };
  },
};
</script>
