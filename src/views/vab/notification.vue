<template>
  <div class="notification-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>通知中心</span>
          <el-button @click="refreshNotifications" style="float: right;">
            刷新
          </el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部通知" name="all">
          <el-table 
            :data="filteredNotifications" 
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="title" label="标题" width="200">
              <template #default="{ row }">
                <el-badge 
                  v-if="!row.read" 
                  is-dot 
                  class="item"
                >
                  {{ row.title }}
                </el-badge>
                <span v-else>{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容">
              <template #default="{ row }">
                <div class="notification-content">{{ row.content }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="sender" label="发送者" width="120" />
            <el-table-column prop="date" label="时间" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button v-if="!row.read" type="primary" size="small" @click="markAsRead(row)">
                  标为已读
                </el-button>
                <el-button v-else size="small" @click="markAsUnread(row)">
                  标为未读
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="未读通知" name="unread">
          <el-table 
            :data="unreadNotifications" 
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="title" label="标题" width="200">
              <template #default="{ row }">
                <el-badge is-dot class="item">
                  {{ row.title }}
                </el-badge>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容">
              <template #default="{ row }">
                <div class="notification-content">{{ row.content }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="sender" label="发送者" width="120" />
            <el-table-column prop="date" label="时间" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="markAsRead(row)">
                  标为已读
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="已读通知" name="read">
          <el-table 
            :data="readNotifications" 
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="title" label="标题" width="200" />
            <el-table-column prop="content" label="内容">
              <template #default="{ row }">
                <div class="notification-content">{{ row.content }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="sender" label="发送者" width="120" />
            <el-table-column prop="date" label="时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="markAsUnread(row)">
                  标为未读
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalNotifications"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  NOTICE_EVENT,
  emitNoticeChange,
  fetchPublishedNotifications,
  loadReadIds as readNoticeIds,
  persistReadIds as saveNoticeReadIds,
} from "@/utils/noticeCenter";

export default {
  name: "Notification",
  data() {
    return {
      activeTab: "all",
      currentPage: 1,
      pageSize: 10,
      totalNotifications: 0,
      loading: false,
      notifications: [],
      readIds: [],
    };
  },
  created() {
    this.readIds = this.loadReadIds();
    this.refreshNotifications();
    window.$eventBus.on(NOTICE_EVENT, this.handleNoticeChange);
  },
  beforeUnmount() {
    window.$eventBus.off(NOTICE_EVENT, this.handleNoticeChange);
  },
  computed: {
    filteredNotifications() {
      const source = this.resolveTabItems(this.activeTab);
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return source.slice(start, end);
    },
    unreadNotifications() {
      return this.notifications.filter((n) => !n.read);
    },
    readNotifications() {
      return this.notifications.filter((n) => n.read);
    },
  },
  methods: {
    loadReadIds() {
      return readNoticeIds();
    },
    persistReadIds() {
      saveNoticeReadIds(this.readIds);
    },
    resolveTabItems(tab) {
      if (tab === "unread") return this.unreadNotifications;
      if (tab === "read") return this.readNotifications;
      return this.notifications;
    },
    handleTabChange(tab) {
      this.activeTab = tab;
      this.currentPage = 1;
      this.totalNotifications = this.resolveTabItems(tab).length;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    markAsRead(notification) {
      const index = this.notifications.findIndex((n) => n.id === notification.id);
      if (index !== -1 && !this.notifications[index].read) {
        this.notifications[index].read = true;
        if (!this.readIds.includes(notification.id)) {
          this.readIds.push(notification.id);
          this.persistReadIds();
        }
        this.totalNotifications = this.resolveTabItems(this.activeTab).length;
        emitNoticeChange({ unreadCount: this.unreadNotifications.length });
        this.$message.success("已标记为已读");
      }
    },
    markAsUnread(notification) {
      const index = this.notifications.findIndex((n) => n.id === notification.id);
      if (index !== -1) {
        this.notifications[index].read = false;
        this.readIds = this.readIds.filter((id) => id !== notification.id);
        this.persistReadIds();
        this.totalNotifications = this.resolveTabItems(this.activeTab).length;
        emitNoticeChange({ unreadCount: this.unreadNotifications.length });
        this.$message.success("已标记为未读");
      }
    },
    async handleNoticeChange(payload = {}) {
      if (typeof payload.unreadCount === "number") return;
      this.readIds = this.loadReadIds();
      await this.refreshNotifications({ silent: true });
    },
    async refreshNotifications(options = {}) {
      this.loading = true;
      try {
        const { notifications, unreadCount } = await fetchPublishedNotifications();
        this.readIds = this.loadReadIds();
        this.notifications = notifications;
        this.totalNotifications = this.resolveTabItems(this.activeTab).length;
        const currentNoticeId = Number(this.$route.query.noticeId);
        if (currentNoticeId) {
          const target = this.notifications.find((item) => item.id === currentNoticeId);
          if (target) {
            this.markAsRead(target);
          }
        }
        emitNoticeChange({ unreadCount });
        if (!options.silent) this.$message.success("刷新成功");
      } catch (error) {
        this.$message.error("刷新失败");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.notification-container {
  padding: 20px;
  
  .card-header {
    font-weight: bold;
  }
  
  .notification-content {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
