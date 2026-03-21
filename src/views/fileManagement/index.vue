<template>
  <div class="fileManagement-container">
    <vab-page-header description="统一文件管理母版，包含公开文件区与私有文件区" :icon="['fas', 'folder-open']" title="文件资源管理" />

    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="公开文件区" name="public">
        <div>
          <el-upload
            style="display: inline-block"
            :action="publicUploadUrl"
            :headers="authHeaders"
            :show-file-list="false"
            :before-upload="(file) => handleBeforeUpload('public', file)"
            :on-progress="handleUploadProgress"
            :on-success="handlePublicUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon> 上传到公开区
            </el-button>
          </el-upload>
          <el-button style="margin-left: 10px" type="danger" @click="handleBatchDelete('public')">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
        </div>
        <el-table style="margin-top: 16px" :data="publicFiles" @selection-change="handlePublicSelectionChange">
          <el-table-column type="selection" width="48" />
          <el-table-column label="文件名" prop="name" />
          <el-table-column label="大小(字节)" prop="size" width="140" />
          <el-table-column label="更新时间" prop="updatedAt" width="180" />
          <el-table-column label="操作" width="260">
            <template #default="{ row }">
              <el-button type="text" @click="copyPublicUrl(row)">
                <el-icon><Link /></el-icon> 复制链接
              </el-button>
              <el-button type="text" @click="openPublicUrl(row)">
                <el-icon><Download /></el-icon> 下载
              </el-button>
              <el-button type="text" @click="handleDeleteFile('public', row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="私有文件区" name="private">
        <div>
          <el-upload
            style="display: inline-block"
            :action="privateUploadUrl"
            :headers="authHeaders"
            :show-file-list="false"
            :before-upload="(file) => handleBeforeUpload('private', file)"
            :on-progress="handleUploadProgress"
            :on-success="handlePrivateUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-button type="warning">
              <el-icon><Upload /></el-icon> 上传到私有区
            </el-button>
          </el-upload>
          <el-button style="margin-left: 10px" type="danger" @click="handleBatchDelete('private')">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
        </div>
        <el-table style="margin-top: 16px" :data="privateFiles" @selection-change="handlePrivateSelectionChange">
          <el-table-column type="selection" width="48" />
          <el-table-column label="文件名" prop="name" />
          <el-table-column label="大小(字节)" prop="size" width="140" />
          <el-table-column label="更新时间" prop="updatedAt" width="180" />
          <el-table-column label="操作" width="220">
            <template #default="{ row }">
              <el-button type="text" @click="downloadPrivate(row)">
                <el-icon><Download /></el-icon> 后台下载
              </el-button>
              <el-button type="text" @click="handleDeleteFile('private', row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { baseURL, tokenName } from "@/config";
import { deletePrivateFile, deletePublicFile, getPrivateFiles, getPublicFiles } from "@/api/fileManagement";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { Upload, Delete, Link, Download } from "@element-plus/icons-vue";

export default {
  name: "FileManagement",
  components: { Upload, Delete, Link, Download },
  setup() {
    const store = useStore();
    const activeName = ref("public");
    const publicFiles = ref([]);
    const privateFiles = ref([]);
    const publicSelection = ref([]);
    const privateSelection = ref([]);
    let uploadLoading = null;

    const accessToken = computed(() => store.getters["user/accessToken"]);

    const apiOrigin = computed(() => {
      if (baseURL.startsWith("http")) return baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
      return window.location.origin.replace(/\/$/, "");
    });

    const publicUploadUrl = computed(() => `${apiOrigin.value}/api/fileManagement/public/upload`);
    const privateUploadUrl = computed(() => `${apiOrigin.value}/api/fileManagement/private/upload`);

    const authHeaders = computed(() => ({
      [tokenName]: accessToken.value,
    }));

    const handlePublicSelectionChange = (rows) => {
      publicSelection.value = rows || [];
    };

    const handlePrivateSelectionChange = (rows) => {
      privateSelection.value = rows || [];
    };

    const closeUploadLoading = () => {
      if (uploadLoading && uploadLoading.close) {
        uploadLoading.close();
      }
      uploadLoading = null;
    };

    const handleBeforeUpload = (area, file) => {
      const areaName = area === "public" ? "公开区" : "私有区";
      const fileName = (file && file.name) || "当前文件";
      closeUploadLoading();
      uploadLoading = ElLoading.service({
        lock: true,
        text: `正在上传到${areaName}：${fileName}`,
      });
      return true;
    };

    const handleUploadProgress = () => {
      if (!uploadLoading) {
        uploadLoading = ElLoading.service({
          lock: true,
          text: "文件上传中，请稍候...",
        });
      }
    };

    const escapeHtml = (text) => {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const showUploadResult = (title, message) => {
      ElMessageBox.alert(`<div style="line-height: 1.8;">${escapeHtml(message)}</div>`, title, {
        dangerouslyUseHTMLString: true,
      });
    };

    const fetchPublicFiles = async () => {
      try {
        const { data } = await getPublicFiles();
        publicFiles.value = data || [];
      } catch (e) {
        ElMessage.error("公开文件列表刷新失败");
      }
    };

    const fetchPrivateFiles = async () => {
      try {
        const { data } = await getPrivateFiles();
        privateFiles.value = data || [];
      } catch (e) {
        ElMessage.error("私有文件列表刷新失败");
      }
    };

    const handleUploadSuccess = async (area, response, file) => {
      const areaName = area === "public" ? "公开区" : "私有区";
      const fileName = (file && file.name) || "当前文件";
      if (!response || response.code !== 200) {
        closeUploadLoading();
        const reason = (response && response.msg) || "服务端返回异常";
        showUploadResult("上传失败", `${fileName} 上传到${areaName}失败：${reason}`);
        return;
      }
      if (area === "public") await fetchPublicFiles();
      else await fetchPrivateFiles();
      closeUploadLoading();
      showUploadResult("上传成功", `${fileName} 已上传到${areaName}，列表已自动刷新。`);
    };

    const handlePublicUploadSuccess = async (response, file) => {
      await handleUploadSuccess("public", response, file);
    };

    const handlePrivateUploadSuccess = async (response, file) => {
      await handleUploadSuccess("private", response, file);
    };

    const handleUploadError = (err, file) => {
      closeUploadLoading();
      const fileName = (file && file.name) || "当前文件";
      const reason = (err && err.message) || "网络或服务异常";
      showUploadResult("上传失败", `${fileName} 上传失败：${reason}`);
    };

    const getDeleteErrorMessage = (err) => {
      const data = err && err.response && err.response.data;
      return (data && data.msg) || (err && err.message) || "未知异常";
    };

    const handleDeleteFile = (area, row) => {
      const areaName = area === "public" ? "公开区" : "私有区";
      const fileName = (row && row.name) || "";
      if (!fileName) {
        ElMessage.error("文件名不存在，无法删除");
        return;
      }
      ElMessageBox.confirm(`确认删除${areaName}文件【${escapeHtml(fileName)}】吗？`, "删除确认", {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            if (area === "public") await deletePublicFile({ name: fileName });
            else await deletePrivateFile({ name: fileName });
            if (area === "public") await fetchPublicFiles();
            else await fetchPrivateFiles();
            ElMessage.success("删除成功");
          } catch (e) {
            const reason = getDeleteErrorMessage(e);
            ElMessageBox.alert(`${escapeHtml(fileName)} 删除失败：${escapeHtml(reason)}`, "删除失败");
          }
        })
        .catch(() => {});
    };

    const runBatchDelete = async (area, names) => {
      const tasks = names.map(async (name) => {
        const safeName = String(name || "").trim();
        if (!safeName) return { ok: false, name: "未知文件", reason: "文件名缺失" };
        try {
          if (area === "public") await deletePublicFile({ name: safeName });
          else await deletePrivateFile({ name: safeName });
          return { ok: true, name: safeName };
        } catch (e) {
          return { ok: false, name: safeName, reason: getDeleteErrorMessage(e) };
        }
      });
      const results = await Promise.all(tasks);
      const successNames = results.filter((item) => item.ok).map((item) => item.name);
      const failedItems = results.filter((item) => !item.ok);
      if (area === "public") {
        publicSelection.value = [];
        await fetchPublicFiles();
      } else {
        privateSelection.value = [];
        await fetchPrivateFiles();
      }
      return { successNames, failedItems };
    };

    const showBatchDeleteSummary = (areaName, successNames, failedItems, title = "批量删除结果") => {
      const successCount = successNames.length;
      const failedCount = failedItems.length;
      let html = `<div style="line-height: 1.8;">`;
      html += `<div>批量删除完成（${areaName}）</div>`;
      html += `<div>成功：${successCount} 个，失败：${failedCount} 个</div>`;
      if (successCount > 0) {
        html += `<div style="margin-top: 8px;">成功文件：</div>`;
        html += `<div>${escapeHtml(successNames.join("、"))}</div>`;
      }
      if (failedCount > 0) {
        html += `<div style="margin-top: 8px;">失败文件：</div>`;
        html += `<div>`;
        html += failedItems
          .map((item) => `${escapeHtml(item.name)}（${escapeHtml(item.reason)}）`)
          .join("<br>");
        html += `</div>`;
      }
      html += `</div>`;
      ElMessageBox.alert(html, title, {
        dangerouslyUseHTMLString: true,
      });
    };

    const promptRetryFailedItems = (area, areaName, failedItems) => {
      if (!failedItems || failedItems.length === 0) return;
      ElMessageBox.confirm(
        `检测到${failedItems.length}个文件删除失败，是否一键重试失败项？`,
        "失败项重试",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          const retryNames = failedItems.map((item) => item.name);
          const retryResult = await runBatchDelete(area, retryNames);
          showBatchDeleteSummary(areaName, retryResult.successNames, retryResult.failedItems, "失败项重试结果");
          if (retryResult.failedItems.length === 0) ElMessage.success("失败项重试成功");
          else ElMessage.warning("仍有失败项，请查看结果详情");
        })
        .catch(() => {});
    };

    const handleBatchDelete = (area) => {
      const areaName = area === "public" ? "公开区" : "私有区";
      const rows = area === "public" ? publicSelection.value : privateSelection.value;
      if (!rows || rows.length === 0) {
        ElMessage.error(`请先勾选要删除的${areaName}文件`);
        return;
      }
      ElMessageBox.confirm(`确认批量删除${rows.length}个${areaName}文件吗？`, "批量删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const names = rows.map((item) => (item && item.name) || "");
          const { successNames, failedItems } = await runBatchDelete(area, names);
          showBatchDeleteSummary(areaName, successNames, failedItems);
          if (failedItems.length === 0) {
            ElMessage.success(`已删除${successNames.length}个文件`);
          } else if (successNames.length > 0) {
            ElMessage.warning(`部分删除成功：${successNames.length}个成功，${failedItems.length}个失败`);
          } else {
            ElMessage.error("批量删除失败，请查看结果详情");
          }
          promptRetryFailedItems(area, areaName, failedItems);
        })
        .catch(() => {});
    };

    const getPublicDownloadUrl = (row) => {
      const raw = String((row && row.downloadUrl) || "").trim();
      if (raw) {
        if (/^https?:\/\//i.test(raw)) return raw;
        return raw.startsWith("/") ? `${apiOrigin.value}${raw}` : `${apiOrigin.value}/${raw}`;
      }
      if (row && row.name) return `${apiOrigin.value}/files/public/${encodeURIComponent(row.name)}`;
      return "";
    };

    const openPublicUrl = (row) => {
      const url = getPublicDownloadUrl(row);
      if (!url) {
        ElMessage.error("未找到可用下载链接");
        return;
      }
      window.open(url, "_blank");
    };

    const copyByTextarea = (text) => {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "readonly");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    };

    const showCopiedUrlPreview = (url) => {
      const safeUrl = escapeHtml(url);
      ElMessageBox.alert(
        `<div style="word-break: break-all; line-height: 1.8;">
          <div>链接已复制到剪贴板，可直接点击预览：</div>
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>
        </div>`,
        "链接预览",
        {
          dangerouslyUseHTMLString: true,
        }
      );
    };

    const copyPublicUrl = async (row) => {
      const url = getPublicDownloadUrl(row);
      if (!url) {
        ElMessage.error("未找到可用下载链接");
        return;
      }
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url);
        else copyByTextarea(url);
        ElMessage.success("链接已复制");
        showCopiedUrlPreview(url);
      } catch (e) {
        ElMessage.error(`复制失败，请手动复制：${url}`);
      }
    };

    const downloadPrivate = async (row) => {
      const url = `${apiOrigin.value}/api/fileManagement/private/download/${encodeURIComponent(row.name)}`;
      const response = await axios.get(url, {
        responseType: "blob",
        headers: authHeaders.value,
      });
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = row.name;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    onMounted(() => {
      fetchPublicFiles();
      fetchPrivateFiles();
    });

    onBeforeUnmount(() => {
      closeUploadLoading();
    });

    return {
      activeName,
      publicFiles,
      privateFiles,
      publicUploadUrl,
      privateUploadUrl,
      authHeaders,
      handlePublicSelectionChange,
      handlePrivateSelectionChange,
      handleBeforeUpload,
      handleUploadProgress,
      handlePublicUploadSuccess,
      handlePrivateUploadSuccess,
      handleUploadError,
      handleDeleteFile,
      handleBatchDelete,
      openPublicUrl,
      copyPublicUrl,
      downloadPrivate,
    };
  },
};
</script>
