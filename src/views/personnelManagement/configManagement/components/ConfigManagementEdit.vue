<template>
  <el-dialog v-model="dialogFormVisible" :title="title" width="560px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
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
import { doEdit } from "@/api/configManagement";
import SchemaFormFields from "@/components/SchemaFormFields.vue";

export default {
  name: "ConfigManagementEdit",
  emits: ["fetch-data"],
  components: {
    SchemaFormFields,
  },
  setup(props, { emit }) {
    const fields = [
      { type: "input", label: "配置键", prop: "configKey" },
      { type: "input", label: "配置名称", prop: "name" },
      { type: "input", label: "分组", prop: "group" },
      {
        type: "select",
        label: "值类型",
        prop: "valueType",
        options: [
          { label: "字符串", value: "string" },
          { label: "布尔", value: "boolean" },
          { label: "数字", value: "number" },
          { label: "JSON", value: "json" },
        ],
      },
      { type: "textarea", label: "配置值", prop: "configValue", rows: 4 },
      { type: "textarea", label: "备注", prop: "remark", rows: 3 },
    ];
    const rules = {
      configKey: [{ required: true, trigger: "blur", message: "请输入配置键" }],
      name: [{ required: true, trigger: "blur", message: "请输入配置名称" }],
      group: [{ required: true, trigger: "blur", message: "请输入配置分组" }],
    };
    const dialog = useEditDialog(
      {
        createEmptyForm: () => ({
          id: "",
          configKey: "",
          configValue: "",
          name: "",
          group: "",
          valueType: "string",
          remark: "",
        }),
        buildEditForm: (row) => ({
          id: row.id,
          configKey: row.configKey || "",
          configValue: row.configValue || "",
          name: row.name || "",
          group: row.group || "",
          valueType: row.valueType || "string",
          remark: row.remark || "",
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
