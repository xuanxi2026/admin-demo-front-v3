import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneValue(item)])
    );
  }
  return value;
}

function syncReactive(target, source) {
  Object.keys(target).forEach((key) => {
    if (!(key in source)) {
      delete target[key];
    }
  });

  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      target[key] = [...value];
      return;
    }

    if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) {
        target[key] = {};
      }
      syncReactive(target[key], value);
      return;
    }

    target[key] = value;
  });
}

export function useEditDialog(options, emit) {
  const {
    createEmptyForm,
    buildEditForm,
    saveFn,
    saveSuccessFallback = "保存成功",
  } = options;

  const formRef = ref(null);
  const dialogFormVisible = ref(false);
  const title = ref("");
  const form = reactive(cloneValue(createEmptyForm()));

  const applyFormState = (value) => {
    syncReactive(form, cloneValue(value));
  };

  const showEdit = (row) => {
    title.value = row?.id ? "编辑" : "添加";
    applyFormState(row?.id ? buildEditForm(row) : createEmptyForm());
    dialogFormVisible.value = true;
  };

  const close = () => {
    formRef.value?.resetFields();
    applyFormState(createEmptyForm());
    dialogFormVisible.value = false;
  };

  const save = async () => {
    formRef.value.validate(async (valid) => {
      if (!valid) return false;
      const { msg } = await saveFn(form);
      ElMessage.success(msg || saveSuccessFallback);
      emit("fetch-data");
      close();
    });
  };

  return {
    formRef,
    dialogFormVisible,
    title,
    form,
    showEdit,
    close,
    save,
  };
}
