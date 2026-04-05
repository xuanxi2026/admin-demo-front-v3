<template>
  <el-form :inline="true" :model="model" @submit.prevent>
    <template v-for="field in fields" :key="field.prop">
      <el-form-item :label="field.label" :prop="field.prop">
        <el-input
          v-if="field.type === 'input' || !field.type"
          :model-value="getValue(field.prop)"
          :clearable="field.clearable !== false"
          :placeholder="field.placeholder"
          :style="resolveStyle(field)"
          @update:model-value="(value) => setValue(field.prop, value)"
        />
        <el-select
          v-else-if="field.type === 'select'"
          :model-value="getValue(field.prop)"
          :clearable="field.clearable !== false"
          :placeholder="field.placeholder"
          :style="resolveStyle(field)"
          @update:model-value="(value) => setValue(field.prop, value)"
        >
          <el-option
            v-for="option in field.options || []"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </template>
    <el-form-item>
      <el-button type="primary" @click="$emit('search')">
        <el-icon><Search /></el-icon> 查询
      </el-button>
      <el-button @click="$emit('reset')">
        <el-icon><RefreshRight /></el-icon> 重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { RefreshRight, Search } from "@element-plus/icons-vue";

function getByPath(target, path) {
  return path.split(".").reduce((current, key) => current?.[key], target);
}

function setByPath(target, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const current = keys.reduce((acc, key) => {
    if (!acc[key] || typeof acc[key] !== "object") {
      acc[key] = {};
    }
    return acc[key];
  }, target);
  current[lastKey] = value;
}

export default {
  name: "SchemaQueryForm",
  components: {
    Search,
    RefreshRight,
  },
  emits: ["search", "reset"],
  props: {
    fields: {
      type: Array,
      default: () => [],
    },
    model: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const getValue = (prop) => getByPath(props.model, prop);
    const setValue = (prop, value) => setByPath(props.model, prop, value?.trim?.() ?? value);
    const resolveStyle = (field) => {
      if (field.width) {
        return { width: `${field.width}px` };
      }
      return field.style || { width: "220px" };
    };

    return {
      getValue,
      setValue,
      resolveStyle,
    };
  },
};
</script>
