import { ref, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

export function useTreeCrudPage(options) {
  const {
    fetchListFn,
    fetchTreeFn,
    deleteFn,
    fetchListErrorMessage,
    fetchTreeErrorMessage,
    deleteConfirmMessage = "你确定要删除当前项吗",
    deleteSuccessFallback = "删除成功",
    autoFetch = true,
  } = options;

  const editRef = ref(null);
  const treeData = ref([]);
  const list = ref([]);
  const listLoading = ref(true);
  const elementLoadingText = ref("正在加载...");
  let timeOutID = null;

  const clearLoadingTimer = () => {
    if (timeOutID) {
      clearTimeout(timeOutID);
      timeOutID = null;
    }
  };

  const handleEdit = (row) => {
    editRef.value?.showEdit(row || null);
  };

  const fetchData = async () => {
    listLoading.value = true;
    clearLoadingTimer();
    try {
      const { data } = await fetchListFn();
      list.value = data || [];
    } catch (e) {
      if (fetchListErrorMessage) {
        ElMessage.error(fetchListErrorMessage);
      }
    } finally {
      timeOutID = setTimeout(() => {
        listLoading.value = false;
      }, 300);
    }
  };

  const fetchTreeData = async () => {
    try {
      const { data } = await fetchTreeFn();
      treeData.value = data || [];
    } catch (e) {
      if (fetchTreeErrorMessage) {
        ElMessage.error(fetchTreeErrorMessage);
      }
    }
  };

  const handleDelete = (row) => {
    if (!row?.id || !deleteFn) return false;
    ElMessageBox.confirm(deleteConfirmMessage, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        const { msg } = await deleteFn({ ids: row.id });
        ElMessage.success(msg || deleteSuccessFallback);
        await fetchData();
        await fetchTreeData();
      })
      .catch(() => {});
    return true;
  };

  const handleNodeClick = () => {
    fetchData();
  };

  if (autoFetch) {
    onMounted(() => {
      fetchTreeData();
      fetchData();
    });
  }

  onBeforeUnmount(() => {
    clearLoadingTimer();
  });

  return {
    editRef,
    treeData,
    list,
    listLoading,
    elementLoadingText,
    handleEdit,
    handleDelete,
    fetchData,
    fetchTreeData,
    handleNodeClick,
  };
}
