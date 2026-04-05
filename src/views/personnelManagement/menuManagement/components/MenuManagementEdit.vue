<template>
  <el-dialog v-model="dialogFormVisible" :title="title" width="500px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
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
import { doEdit } from "@/api/menuManagement";
import SchemaFormFields from "@/components/SchemaFormFields.vue";

export default {
  name: "MenuManagementEdit",
  emits: ["fetch-data"],
  components: {
    SchemaFormFields,
  },
  setup(props, { emit }) {
    const fields = [
      { type: "input", label: "name", prop: "name" },
      { type: "input", label: "路径", prop: "path" },
      { type: "input", label: "vue文件路径", prop: "component" },
      { type: "input", label: "标题", prop: "meta.title" },
      { type: "input", label: "图标", prop: "meta.icon" },
      { type: "switch", label: "是否隐藏", prop: "hidden" },
      { type: "switch", label: "是否一直显示", prop: "alwaysShow" },
      { type: "switch", label: "是否固定", prop: "meta.affix" },
      { type: "switch", label: "是否无缓存", prop: "meta.noKeepAlive" },
    ];
    const rules = {
      name: [{ required: true, trigger: "blur", message: "请输入name" }],
      path: [{ required: true, trigger: "blur", message: "请输入路径" }],
      "meta.title": [{ required: true, trigger: "blur", message: "请输入标题" }],
    };
    const dialog = useEditDialog(
      {
        createEmptyForm: () => ({
          id: "",
          name: "",
          path: "",
          component: "",
          hidden: false,
          alwaysShow: false,
          meta: {
            title: "",
            icon: "",
            affix: false,
            noKeepAlive: false,
          },
        }),
        buildEditForm: (row) => ({
          id: row.id || "",
          name: row.name || "",
          path: row.path || "",
          component: row.component || "",
          hidden: row.hidden || false,
          alwaysShow: row.alwaysShow || false,
          meta: {
            title: row.meta?.title || "",
            icon: row.meta?.icon || "",
            affix: row.meta?.affix || false,
            noKeepAlive: row.meta?.noKeepAlive || false,
          },
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
