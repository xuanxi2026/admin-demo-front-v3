<template>
  <el-dialog v-model="dialogFormVisible" :title="title" width="520px" @close="close">
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
import { doEdit } from "@/api/dictManagement";
import SchemaFormFields from "@/components/SchemaFormFields.vue";

export default {
  name: "DictManagementEdit",
  emits: ["fetch-data"],
  components: {
    SchemaFormFields,
  },
  setup(props, { emit }) {
    const fields = [
      { type: "input", label: "字典类型", prop: "dictType" },
      { type: "input", label: "标签", prop: "label" },
      { type: "input", label: "值", prop: "value" },
      {
        type: "select",
        label: "状态",
        prop: "status",
        options: [
          { label: "启用", value: "enabled" },
          { label: "禁用", value: "disabled" },
        ],
      },
      { type: "number", label: "排序", prop: "sort", min: 0 },
      { type: "textarea", label: "备注", prop: "remark", rows: 3 },
    ];
    const rules = {
      dictType: [{ required: true, trigger: "blur", message: "请输入字典类型" }],
      label: [{ required: true, trigger: "blur", message: "请输入标签" }],
      value: [{ required: true, trigger: "blur", message: "请输入值" }],
    };
    const dialog = useEditDialog(
      {
        createEmptyForm: () => ({
          id: "",
          dictType: "",
          label: "",
          value: "",
          status: "enabled",
          sort: 0,
          remark: "",
        }),
        buildEditForm: (row) => ({
          id: row.id,
          dictType: row.dictType || "",
          label: row.label || "",
          value: row.value || "",
          status: row.status || "enabled",
          sort: row.sort || 0,
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
