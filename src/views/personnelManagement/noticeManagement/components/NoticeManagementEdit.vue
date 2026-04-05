<template>
  <el-dialog v-model="dialogFormVisible" :title="title" width="620px" @close="close">
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
import { doEdit } from "@/api/noticeManagement";
import SchemaFormFields from "@/components/SchemaFormFields.vue";

export default {
  name: "NoticeManagementEdit",
  emits: ["fetch-data"],
  components: {
    SchemaFormFields,
  },
  setup(props, { emit }) {
    const fields = [
      { type: "input", label: "公告标题", prop: "title" },
      {
        type: "select",
        label: "公告级别",
        prop: "level",
        options: [
          { label: "普通", value: "normal" },
          { label: "重要", value: "important" },
        ],
      },
      {
        type: "select",
        label: "状态",
        prop: "status",
        options: [
          { label: "草稿", value: "draft" },
          { label: "已发布", value: "published" },
          { label: "已下线", value: "archived" },
        ],
      },
      { type: "input", label: "发布人", prop: "publisher" },
      { type: "number", label: "排序", prop: "sort", min: 0 },
      { type: "textarea", label: "公告内容", prop: "content", rows: 5 },
      { type: "textarea", label: "备注", prop: "remark", rows: 3 },
    ];
    const rules = {
      title: [{ required: true, trigger: "blur", message: "请输入公告标题" }],
      content: [{ required: true, trigger: "blur", message: "请输入公告内容" }],
    };
    const dialog = useEditDialog(
      {
        createEmptyForm: () => ({
          id: "",
          title: "",
          level: "normal",
          status: "draft",
          publisher: "",
          sort: 0,
          content: "",
          remark: "",
        }),
        buildEditForm: (row) => ({
          id: row.id || "",
          title: row.title || "",
          level: row.level || "normal",
          status: row.status || "draft",
          publisher: row.publisher || "",
          sort: row.sort || 0,
          content: row.content || "",
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
