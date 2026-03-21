<template>
  <el-dialog v-model="dialogFormVisible" :title="title" width="500px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="name" prop="name">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="路径" prop="path">
        <el-input v-model="form.path" autocomplete="off" />
      </el-form-item>
      <el-form-item label="vue文件路径" prop="component">
        <el-input v-model="form.component" autocomplete="off" />
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.meta.title" autocomplete="off" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="form.meta.icon" autocomplete="off" />
      </el-form-item>
      <el-form-item label="是否隐藏">
        <el-switch v-model="form.hidden" />
      </el-form-item>
      <el-form-item label="是否一直显示">
        <el-switch v-model="form.alwaysShow" />
      </el-form-item>
      <el-form-item label="是否固定">
        <el-switch v-model="form.meta.affix" />
      </el-form-item>
      <el-form-item label="是否无缓存">
        <el-switch v-model="form.meta.noKeepAlive" />
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
import { doEdit } from "@/api/menuManagement";
import { ElMessage } from "element-plus";

export default {
  name: "MenuManagementEdit",
  emits: ["fetch-data"],
  setup(props, { emit }) {
    const formRef = ref(null);
    const dialogFormVisible = ref(false);
    const title = ref("");
    const form = reactive({
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
    });

    const rules = {
      name: [{ required: true, trigger: "blur", message: "请输入name" }],
      path: [{ required: true, trigger: "blur", message: "请输入路径" }],
      "meta.title": [{ required: true, trigger: "blur", message: "请输入标题" }],
    };

    const showEdit = (row) => {
      if (row && row.path) {
        title.value = "编辑";
        form.id = row.id || "";
        form.name = row.name || "";
        form.path = row.path || "";
        form.component = row.component || "";
        form.hidden = row.hidden || false;
        form.alwaysShow = row.alwaysShow || false;
        form.meta.title = row.meta?.title || "";
        form.meta.icon = row.meta?.icon || "";
        form.meta.affix = row.meta?.affix || false;
        form.meta.noKeepAlive = row.meta?.noKeepAlive || false;
      } else {
        title.value = "添加";
        form.id = "";
        form.name = "";
        form.path = "";
        form.component = "";
        form.hidden = false;
        form.alwaysShow = false;
        form.meta.title = "";
        form.meta.icon = "";
        form.meta.affix = false;
        form.meta.noKeepAlive = false;
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
