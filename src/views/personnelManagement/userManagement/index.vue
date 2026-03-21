<template>
  <div class="userManagement-container">
    <vab-page-header description="系统用户管理，支持添加、编辑、删除用户信息" :icon="['fas', 'users']" title="用户管理" />

    <div class="query-form">
      <el-row>
        <el-col :span="12">
          <el-button type="primary" @click="handleEdit">
            <el-icon><Plus /></el-icon> 添加
          </el-button>
          <el-button type="danger" @click="handleDelete">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-form :inline="true" :model="queryForm" @submit.prevent>
            <el-form-item>
              <el-input v-model.trim="queryForm.username" clearable placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryData">
                <el-icon><Search /></el-icon> 查询
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>

    <el-table v-loading="listLoading" :data="list" :element-loading-text="elementLoadingText" @selection-change="setSelectRows">
      <el-table-column show-overflow-tooltip type="selection" />
      <el-table-column label="id" prop="id" show-overflow-tooltip />
      <el-table-column label="用户名" prop="username" show-overflow-tooltip />
      <el-table-column label="邮箱" prop="email" show-overflow-tooltip />
      <el-table-column label="权限" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tag v-for="(item, index) in row.permissions" :key="index">
            {{ item }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" prop="datatime" show-overflow-tooltip />
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
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
import { doDelete, getList } from "@/api/userManagement";
import Edit from "./components/UserManagementEdit.vue";
import VabPageHeader from "@/components/VabPageHeader";
import { Plus, Delete, Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "UserManagement",
  components: {
    Edit,
    VabPageHeader,
    Plus,
    Delete,
    Search,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const editRef = ref(null);
    const list = ref([]);
    const listLoading = ref(true);
    const layout = ref("total, sizes, prev, pager, next, jumper");
    const total = ref(0);
    const selectRows = ref([]);
    const elementLoadingText = ref("正在加载...");
    const queryForm = reactive({
      pageNo: 1,
      pageSize: 10,
      username: "",
    });
    let timeOutID = null;

    const setSelectRows = (val) => {
      selectRows.value = val;
    };

    const handleEdit = (row) => {
      if (editRef.value) {
        if (row && row.id) {
          editRef.value.showEdit(row);
        } else {
          editRef.value.showEdit();
        }
      }
    };

    const handleDelete = (row) => {
      if (row && row.id) {
        ElMessageBox.confirm("你确定要删除当前项吗", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(async () => {
            const { msg } = await doDelete({ ids: row.id });
            ElMessage.success(msg);
            fetchData();
          })
          .catch(() => {});
      } else {
        if (selectRows.value.length > 0) {
          const ids = selectRows.value.map((item) => item.id).join();
          ElMessageBox.confirm("你确定要删除选中项吗", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(async () => {
              const { msg } = await doDelete({ ids });
              ElMessage.success(msg);
              fetchData();
            })
            .catch(() => {});
        } else {
          ElMessage.error("未选中任何行");
          return false;
        }
      }
    };

    const handleSizeChange = (val) => {
      queryForm.pageSize = val;
      fetchData();
    };

    const handleCurrentChange = (val) => {
      queryForm.pageNo = val;
      fetchData();
    };

    const queryData = () => {
      queryForm.pageNo = 1;
      fetchData();
    };

    const fetchData = async () => {
      listLoading.value = true;
      try {
        const { data, totalCount } = await getList(queryForm);
        list.value = data || [];
        total.value = totalCount || 0;
      } catch (e) {
        ElMessage.error("用户列表加载失败，请检查后端接口是否已启动");
      } finally {
        timeOutID = setTimeout(() => {
          listLoading.value = false;
        }, 300);
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      editRef,
      list,
      listLoading,
      layout,
      total,
      elementLoadingText,
      queryForm,
      setSelectRows,
      handleEdit,
      handleDelete,
      handleSizeChange,
      handleCurrentChange,
      queryData,
      fetchData,
    };
  },
};
</script>

<style scoped>
.query-form {
  margin: 20px 0;
}
</style>
