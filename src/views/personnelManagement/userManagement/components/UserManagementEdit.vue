<template>
  <el-dialog v-model="dialogFormVisible" :title="title" width="500px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" autocomplete="off" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" autocomplete="off" />
      </el-form-item>
      <el-form-item label="权限" prop="permissions">
        <el-select v-model="form.permissions" multiple placeholder="请选择权限" style="width: 100%">
          <el-option label="admin" value="admin" />
          <el-option label="editor" value="editor" />
          <el-option label="user" value="user" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive } from "vue";
import { doEdit } from "@/api/userManagement";
import { ElMessage } from "element-plus";

export default {
  name: "UserManagementEdit",
  emits: ["fetch-data"],
  setup(props, { emit }) {
    const formRef = ref(null);
    const dialogFormVisible = ref(false);
    const title = ref("");
    const form = reactive({
      id: "",
      username: "",
      email: "",
      permissions: [],
    });

    const rules = {
      username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
      email: [{ required: true, trigger: "blur", message: "请输入邮箱" }],
    };

    const showEdit = (row) => {
      if (row && row.id) {
        title.value = "编辑";
        form.id = row.id;
        form.username = row.username;
        form.email = row.email;
        form.permissions = row.permissions || [];
      } else {
        title.value = "添加";
        form.id = "";
        form.username = "";
        form.email = "";
        form.permissions = [];
      }
      dialogFormVisible.value = true;
    };

    const close = () => {
      formRef.value?.resetFields();
      dialogFormVisible.value = false;
    };

    const save = async () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          const { msg } = await doEdit(form);
          ElMessage.success(msg);
          emit("fetch-data");
          close();
        } else {
          return false;
        }
      });
    };

    return {
      formRef,
      dialogFormVisible,
      title,
      form,
      rules,
      showEdit,
      close,
      save,
    };
  },
};
</script>
