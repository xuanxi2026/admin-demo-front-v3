<template>
  <div class="noticeManagement-container">
    <vab-page-header description="通知公告管理，沉淀后台系统通用的信息发布能力" :icon="['fas', 'bullhorn']" title="通知公告" />

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
import { doDelete, getList } from "@/api/noticeManagement";
import Edit from "./components/NoticeManagementEdit.vue";
import CrudToolbar from "@/components/CrudToolbar.vue";
import SchemaTableColumns from "@/components/SchemaTableColumns.vue";
import VabPageHeader from "@/components/VabPageHeader";

export default {
  name: "NoticeManagement",
  components: {
    Edit,
    CrudToolbar,
    SchemaTableColumns,
    VabPageHeader,
  },
  setup() {
    const queryFields = [
      {
        prop: "level",
        type: "select",
        placeholder: "公告级别",
        width: 160,
        options: [
          { label: "普通", value: "normal" },
          { label: "重要", value: "important" },
        ],
      },
      { prop: "keyword", placeholder: "标题/内容/发布人", width: 260 },
    ];
    const tableColumns = [
      { label: "ID", prop: "id", width: 80 },
      { label: "标题", prop: "title", minWidth: 180 },
      { label: "级别", prop: "level", width: 100 },
      { label: "状态", prop: "status", width: 100 },
      { label: "发布人", prop: "publisher", width: 120 },
      { label: "排序", prop: "sort", width: 90 },
      { label: "内容", prop: "content", minWidth: 220 },
      { label: "备注", prop: "remark", minWidth: 160 },
      { label: "修改时间", prop: "datatime", width: 180 },
    ];
    const crud = useCrudPage({
      initialQueryForm: {
        pageNo: 1,
        pageSize: 10,
        level: "",
        keyword: "",
      },
      fetchFn: getList,
      deleteFn: doDelete,
      fetchErrorMessage: "通知公告加载失败，请检查后端接口是否已启动",
    });

    return {
      ...crud,
      queryFields,
      tableColumns,
    };
  },
};
</script>
