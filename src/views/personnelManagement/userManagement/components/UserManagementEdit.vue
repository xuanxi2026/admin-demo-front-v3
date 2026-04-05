<template>
  <el-dialog v-model="dialogFormVisible" :title="title" width="500px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <schema-form-fields :fields="fields" :form="form" />
    </el-form>
    <template #footer>
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="save">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { useEditDialog } from "@/composables/useEditDialog";
import { doEdit } from "@/api/userManagement";
import SchemaFormFields from "@/components/SchemaFormFields.vue";

export default {
  name: "UserManagementEdit",
  emits: ["fetch-data"],
  components: {
    SchemaFormFields,
  },
  setup(props, { emit }) {
    const fields = [
      { type: "input", label: "用户名", prop: "username" },
      { type: "input", label: "邮箱", prop: "email" },
      {
        type: "select",
        label: "权限",
        prop: "permissions",
        multiple: true,
        placeholder: "请选择权限",
        options: [
          { label: "admin", value: "admin" },
          { label: "editor", value: "editor" },
          { label: "user", value: "user" },
        ],
      },
    ];
    const rules = {
      username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
      email: [{ required: true, trigger: "blur", message: "请输入邮箱" }],
    };
    const dialog = useEditDialog(
      {
        createEmptyForm: () => ({
          id: "",
          username: "",
          email: "",
          permissions: [],
        }),
        buildEditForm: (row) => ({
          id: row.id,
          username: row.username || "",
          email: row.email || "",
          permissions: row.permissions || [],
        }),
        saveFn: doEdit,
      },
      emit
    );

    return {
      ...dialog,
      fields,
      rules,
    };
  },
};
</script>
