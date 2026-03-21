<template>
  <el-dialog v-model="dialogFormVisible" :title="title" width="500px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="权限码" prop="permission">
        <el-input v-model="form.permission" autocomplete="off" />
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
import { doEdit } from "@/api/roleManagement";
import { ElMessage } from "element-plus";

export default {
  name: "RoleManagementEdit",
  emits: ["fetch-data"],
  setup(props, { emit }) {
    const formRef = ref(null);
    const dialogFormVisible = ref(false);
    const title = ref("");
    const form = reactive({
      id: "",
      permission: "",
    });

    const rules = {
      permission: [{ required: true, trigger: "blur", message: "请输入权限码" }],
    };

    const showEdit = (row) => {
      if (row && row.id) {
        title.value = "编辑";
        form.id = row.id;
        form.permission = row.permission;
      } else {
        title.value = "添加";
        form.id = "";
        form.permission = "";
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
