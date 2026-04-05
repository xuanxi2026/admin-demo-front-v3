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
import { doEdit } from "@/api/roleManagement";
import SchemaFormFields from "@/components/SchemaFormFields.vue";

export default {
  name: "RoleManagementEdit",
  emits: ["fetch-data"],
  components: {
    SchemaFormFields,
  },
  setup(props, { emit }) {
    const fields = [{ type: "input", label: "权限码", prop: "permission" }];
    const rules = {
      permission: [{ required: true, trigger: "blur", message: "请输入权限码" }],
    };
    const dialog = useEditDialog(
      {
        createEmptyForm: () => ({
          id: "",
          permission: "",
        }),
        buildEditForm: (row) => ({
          id: row.id,
          permission: row.permission || "",
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
