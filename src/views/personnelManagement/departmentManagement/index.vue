<template>
  <div class="departmentManagement-container">
    <vab-page-header description="组织与部门管理，沉淀跨项目通用的组织树配置能力" :icon="['fas', 'sitemap']" title="部门管理" />
    <el-row>
      <el-col :lg="4" :md="8" :sm="24" :xl="4" :xs="24">
        <el-tree :data="treeData" :default-expanded-keys="['root']" node-key="id" :props="defaultProps" @node-click="handleNodeClick" />
      </el-col>
      <el-col :lg="20" :md="16" :sm="24" :xl="20" :xs="24">
        <crud-toolbar show-create @create="handleEdit" />
        <el-table
          v-loading="listLoading"
          border
          :data="list"
          default-expand-all
          :element-loading-text="elementLoadingText"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column label="部门名称" prop="name" min-width="180" show-overflow-tooltip />
          <el-table-column label="部门编码" prop="code" min-width="160" show-overflow-tooltip />
          <el-table-column label="负责人" prop="leader" width="140" show-overflow-tooltip />
          <el-table-column label="联系电话" prop="phone" width="150" show-overflow-tooltip />
          <el-table-column label="状态" prop="status" width="100" show-overflow-tooltip />
          <el-table-column label="排序" prop="sort" width="90" show-overflow-tooltip />
          <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
          <el-table-column label="更新时间" prop="datatime" width="180" show-overflow-tooltip />
          <el-table-column label="操作" show-overflow-tooltip width="200">
            <template #default="{ row }">
              <el-button type="text" @click="handleEdit(row)">编辑</el-button>
              <el-button type="text" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <edit ref="editRef" :tree-options="departmentOptions" @fetch-data="reloadAll" />
  </div>
</template>

<script>
import { computed } from "vue";
import { useTreeCrudPage } from "@/composables/useTreeCrudPage";
import { doDelete, getList, getTree } from "@/api/departmentManagement";
import CrudToolbar from "@/components/CrudToolbar.vue";
import Edit from "./components/DepartmentManagementEdit.vue";
import VabPageHeader from "@/components/VabPageHeader";

export default {
  name: "DepartmentManagement",
  components: {
    CrudToolbar,
    Edit,
    VabPageHeader,
  },
  setup() {
    const defaultProps = {
      children: "children",
      label: "label",
    };
    const crud = useTreeCrudPage({
      fetchListFn: getList,
      fetchTreeFn: getTree,
      deleteFn: doDelete,
      fetchListErrorMessage: "部门列表加载失败，请检查后端接口是否已启动",
      fetchTreeErrorMessage: "部门树加载失败，请检查后端接口是否已启动",
    });

    const flatten = (nodes = [], result = []) => {
      nodes.forEach((node) => {
        if (node.id !== "root") {
          result.push({ label: node.label, value: Number(node.id) });
        }
        flatten(node.children || [], result);
      });
      return result;
    };

    const departmentOptions = computed(() => [{ label: "顶级部门", value: 0 }, ...flatten(crud.treeData.value)]);

    const reloadAll = async () => {
      await crud.fetchData();
      await crud.fetchTreeData();
    };

    return {
      defaultProps,
      departmentOptions,
      reloadAll,
      ...crud,
    };
  },
};
</script>
