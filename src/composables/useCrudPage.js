import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

export function useCrudPage(options) {
  const {
    initialQueryForm,
    fetchFn,
    deleteFn,
    fetchErrorMessage,
    deleteConfirmMessage = "你确定要删除当前项吗",
    deleteSuccessFallback = "删除成功",
    autoFetch = true,
  } = options;

  const editRef = ref(null);
  const list = ref([]);
  const listLoading = ref(true);
  const layout = ref("total, sizes, prev, pager, next, jumper");
  const total = ref(0);
  const selectRows = ref([]);
  const elementLoadingText = ref("正在加载...");
  const initialQueryState = { ...initialQueryForm };
  const queryForm = reactive({ ...initialQueryState });
  let timeOutID = null;

  const clearLoadingTimer = () => {
    if (timeOutID) {
      clearTimeout(timeOutID);
      timeOutID = null;
    }
  };

  const setSelectRows = (val) => {
    selectRows.value = val || [];
  };

  const handleEdit = (row) => {
    editRef.value?.showEdit(row || null);
  };

  const fetchData = async () => {
    listLoading.value = true;
    clearLoadingTimer();
    try {
      const { data, totalCount } = await fetchFn(queryForm);
      list.value = data || [];
      total.value = totalCount || 0;
    } catch (e) {
      if (fetchErrorMessage) {
        ElMessage.error(fetchErrorMessage);
      }
    } finally {
      timeOutID = setTimeout(() => {
        listLoading.value = false;
      }, 300);
    }
  };

  const handleSizeChange = (val) => {
    queryForm.pageSize = val;
    fetchData();
  };

  const handleCurrentChange = (val) => {
    queryForm.pageNo = val;
    fetchData();
  };

  const queryData = () => {
    queryForm.pageNo = 1;
    fetchData();
  };

  const resetQuery = () => {
    Object.keys(queryForm).forEach((key) => {
      delete queryForm[key];
    });
    Object.assign(queryForm, { ...initialQueryState });
    queryForm.pageNo = 1;
    fetchData();
  };

  const resolveDeleteIds = (row) => {
    if (row?.id) return String(row.id);
    return selectRows.value.map((item) => item.id).join();
  };

  const handleDelete = (row) => {
    if (!deleteFn) return false;
    const ids = resolveDeleteIds(row);
    if (!ids) {
      ElMessage.error("未选中任何行");
      return false;
    }
    ElMessageBox.confirm(deleteConfirmMessage, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        const { msg } = await deleteFn({ ids });
        ElMessage.success(msg || deleteSuccessFallback);
        fetchData();
      })
      .catch(() => {});
    return true;
  };

  if (autoFetch) {
    onMounted(() => {
      fetchData();
    });
  }

  onBeforeUnmount(() => {
    clearLoadingTimer();
  });

  return {
    editRef,
    list,
    listLoading,
    layout,
    total,
    selectRows,
    elementLoadingText,
    queryForm,
    setSelectRows,
    handleEdit,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    queryData,
    resetQuery,
    fetchData,
  };
}
