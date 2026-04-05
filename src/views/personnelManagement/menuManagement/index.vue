<template>
  <div class="menuManagement-container">
    <vab-page-header description="系统菜单配置管理，支持菜单的增删改查操作" :icon="['fas', 'bars']" title="菜单管理" />
    <el-divider content-position="left">
      演示环境仅做基础功能展示，若想实现不同角色的真实菜单配置，需将settings.js路由加载模式改为all模式，由后端全面接管路由渲染与权限控制
    </el-divider>
    <el-row>
      <el-col :lg="4" :md="8" :sm="24" :xl="4" :xs="24">
        <el-tree
          :data="treeData"
          :default-expanded-keys="['root']"
          node-key="id"
          :props="defaultProps"
          @node-click="handleNodeClick"
        />
      </el-col>
      <el-col :lg="20" :md="16" :sm="24" :xl="20" :xs="24">
        <crud-toolbar show-create @create="handleEdit" />
        <el-table
          v-loading="listLoading"
          border
          :data="list"
          default-expand-all
          :element-loading-text="elementLoadingText"
          row-key="path"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column label="name" prop="name" show-overflow-tooltip />
          <el-table-column label="路径" prop="path" show-overflow-tooltip />
          <el-table-column label="是否隐藏" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.hidden ? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="是否一直显示当前节点" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.alwaysShow ? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="vue文件路径" prop="component" show-overflow-tooltip />
          <el-table-column label="重定向" prop="redirect" show-overflow-tooltip />
          <el-table-column label="标题" prop="meta.title" show-overflow-tooltip />
          <el-table-column label="图标" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.meta && row.meta.icon">
                <el-icon><component :is="row.meta.icon" /></el-icon>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="是否固定" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.meta">{{ row.meta.affix ? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="是否无缓存" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.meta">{{ row.meta.noKeepAlive ? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="badge" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.meta">{{ row.meta.badge }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" show-overflow-tooltip width="200">
            <template #default="{ row }">
              <el-button type="text" @click="handleEdit(row)">编辑</el-button>
              <el-button type="text" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <edit ref="editRef" @fetch-data="fetchData" />
  </div>
</template>

<script>
import { useTreeCrudPage } from "@/composables/useTreeCrudPage";
import { getRouterList as getList } from "@/api/router";
import { doDelete, getTree } from "@/api/menuManagement";
import CrudToolbar from "@/components/CrudToolbar.vue";
import Edit from "./components/MenuManagementEdit.vue";
import VabPageHeader from "@/components/VabPageHeader";

export default {
  name: "MenuManagement",
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
      fetchListErrorMessage: "菜单列表加载失败，请检查后端接口是否已启动",
      fetchTreeErrorMessage: "菜单树加载失败，请检查后端接口是否已启动",
    });

    return {
      defaultProps,
      ...crud,
    };
  },
};
</script>
