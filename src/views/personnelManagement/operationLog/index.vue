<template>
  <div class="operationLog-container">
    <vab-page-header description="操作日志管理，记录后台关键变更动作，便于排查和复盘" :icon="['fas', 'clipboard-list']" title="操作日志" />

    <crud-toolbar :model="queryForm" :query-fields="queryFields" @reset="resetQuery" @search="queryData" />

    <el-table v-loading="listLoading" :data="list" :element-loading-text="elementLoadingText">
      <schema-table-columns :columns="tableColumns" />
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
  </div>
</template>

<script>
import { useCrudPage } from "@/composables/useCrudPage";
import { getList } from "@/api/operationLog";
import CrudToolbar from "@/components/CrudToolbar.vue";
import SchemaTableColumns from "@/components/SchemaTableColumns.vue";
import VabPageHeader from "@/components/VabPageHeader";

export default {
  name: "OperationLog",
  components: {
    CrudToolbar,
    SchemaTableColumns,
    VabPageHeader,
  },
  setup() {
    const queryFields = [
      { prop: "module", placeholder: "模块名", width: 160 },
      { prop: "keyword", placeholder: "操作人/目标/详情/动作", width: 260 },
    ];
    const tableColumns = [
      { label: "ID", prop: "id", width: 80 },
      { label: "模块", prop: "module", width: 120 },
      { label: "动作", prop: "action", width: 150 },
      { label: "操作人", prop: "operator", width: 120 },
      { label: "目标", prop: "target", minWidth: 140 },
      { label: "请求 ID", prop: "requestId", minWidth: 220 },
      { label: "IP", prop: "ip", width: 140 },
      { label: "详情", prop: "detail", minWidth: 220 },
      { label: "时间", prop: "datatime", width: 180 },
    ];
    const crud = useCrudPage({
      initialQueryForm: {
        pageNo: 1,
        pageSize: 10,
        module: "",
        keyword: "",
      },
      fetchFn: getList,
      fetchErrorMessage: "操作日志加载失败，请检查后端接口是否已启动",
    });

    return {
      ...crud,
      queryFields,
      tableColumns,
    };
  },
};
</script>
