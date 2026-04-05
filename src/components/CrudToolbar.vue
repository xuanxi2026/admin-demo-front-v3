<template>
  <div class="crud-toolbar">
    <div v-if="showActions" class="crud-toolbar__actions">
      <slot name="actions">
        <el-button v-if="showCreate" type="primary" @click="$emit('create')">
          <el-icon><Plus /></el-icon> {{ createText }}
        </el-button>
        <el-button v-if="showBatchDelete" type="danger" @click="$emit('batch-delete')">
          <el-icon><Delete /></el-icon> {{ batchDeleteText }}
        </el-button>
      </slot>
    </div>
    <div class="crud-toolbar__query" :class="{ 'crud-toolbar__query--full': !showActions }">
      <slot name="query">
        <schema-query-form
          v-if="queryFields.length"
          :fields="queryFields"
          :model="model"
          @reset="$emit('reset')"
          @search="$emit('search')"
        />
      </slot>
    </div>
  </div>
</template>

<script>
import { Plus, Delete } from "@element-plus/icons-vue";
import SchemaQueryForm from "@/components/SchemaQueryForm.vue";

export default {
  name: "CrudToolbar",
  components: {
    SchemaQueryForm,
    Plus,
    Delete,
  },
  emits: ["create", "batch-delete", "search", "reset"],
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
    queryFields: {
      type: Array,
      default: () => [],
    },
    showCreate: {
      type: Boolean,
      default: false,
    },
    showBatchDelete: {
      type: Boolean,
      default: false,
    },
    createText: {
      type: String,
      default: "添加",
    },
    batchDeleteText: {
      type: String,
      default: "批量删除",
    },
  },
  computed: {
    showActions() {
      return this.showCreate || this.showBatchDelete || !!this.$slots.actions;
    },
  },
};
</script>

<style scoped>
.crud-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin: 20px 0;
}

.crud-toolbar__actions {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;
}

.crud-toolbar__query {
  display: flex;
  justify-content: flex-end;
}

.crud-toolbar__query--full {
  flex: 1;
}
</style>
