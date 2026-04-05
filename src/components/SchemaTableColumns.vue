<template>
  <template v-for="column in columns" :key="column.prop || column.label">
    <el-table-column
      :label="column.label"
      :prop="column.prop"
      :width="column.width"
      :min-width="column.minWidth"
      :show-overflow-tooltip="column.showOverflowTooltip !== false"
    >
      <template v-if="column.type" #default="{ row }">
        <template v-if="column.type === 'tags'">
          <el-tag v-for="(item, index) in resolveValue(row, column) || []" :key="index">
            {{ item }}
          </el-tag>
        </template>
        <template v-else-if="column.type === 'boolean'">
          <span>{{ resolveBooleanText(row, column) }}</span>
        </template>
        <template v-else-if="column.type === 'icon'">
          <span v-if="resolveValue(row, column)">
            <el-icon><component :is="resolveValue(row, column)" /></el-icon>
          </span>
        </template>
        <template v-else>
          <span>{{ resolveDisplayText(row, column) }}</span>
        </template>
      </template>
    </el-table-column>
  </template>
</template>

<script>
function getByPath(target, path) {
  return path.split(".").reduce((current, key) => current?.[key], target);
}

export default {
  name: "SchemaTableColumns",
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const resolveValue = (row, column) => {
      const value = column.prop ? getByPath(row, column.prop) : undefined;
      return column.valueGetter ? column.valueGetter(row, value) : value;
    };

    const resolveDisplayText = (row, column) => {
      const value = resolveValue(row, column);
      if (column.formatter) {
        return column.formatter(row, value);
      }
      return value;
    };

    const resolveBooleanText = (row, column) => {
      const value = !!resolveValue(row, column);
      if (column.booleanMap) {
        return value ? column.booleanMap.true : column.booleanMap.false;
      }
      return value ? "是" : "否";
    };

    return {
      resolveValue,
      resolveDisplayText,
      resolveBooleanText,
    };
  },
};
</script>
