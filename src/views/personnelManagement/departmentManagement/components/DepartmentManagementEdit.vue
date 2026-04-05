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
import { computed } from "vue";
import { useEditDialog } from "@/composables/useEditDialog";
import { doEdit } from "@/api/departmentManagement";
import SchemaFormFields from "@/components/SchemaFormFields.vue";

export default {
  name: "DepartmentManagementEdit",
  emits: ["fetch-data"],
  props: {
    treeOptions: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    SchemaFormFields,
  },
  setup(props, { emit }) {
    const fields = computed(() => [
      { type: "select", label: "上级部门", prop: "parentId", options: props.treeOptions },
      { type: "input", label: "部门名称", prop: "name" },
      { type: "input", label: "部门编码", prop: "code" },
      { type: "input", label: "负责人", prop: "leader" },
      { type: "input", label: "联系电话", prop: "phone" },
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
    ]);
    const rules = {
      name: [{ required: true, trigger: "blur", message: "请输入部门名称" }],
      code: [{ required: true, trigger: "blur", message: "请输入部门编码" }],
    };
    const dialog = useEditDialog(
      {
        createEmptyForm: () => ({
          id: "",
          parentId: 0,
          name: "",
          code: "",
          leader: "",
          phone: "",
          status: "enabled",
          sort: 0,
          remark: "",
        }),
        buildEditForm: (row) => ({
          id: row.id || "",
          parentId: row.parentId ?? 0,
          name: row.name || "",
          code: row.code || "",
          leader: row.leader || "",
          phone: row.phone || "",
          status: row.status || "enabled",
          sort: row.sort ?? 0,
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
