<template>
  <template v-for="field in fields" :key="field.prop">
    <el-form-item :label="field.label" :prop="field.prop">
      <el-input
        v-if="field.type === 'input'"
        :model-value="getValue(field.prop)"
        :autocomplete="field.autocomplete || 'off'"
        :placeholder="field.placeholder"
        @update:model-value="(value) => setValue(field.prop, value)"
      />
      <el-input
        v-else-if="field.type === 'textarea'"
        :model-value="getValue(field.prop)"
        :rows="field.rows || 3"
        :placeholder="field.placeholder"
        type="textarea"
        @update:model-value="(value) => setValue(field.prop, value)"
      />
      <el-select
        v-else-if="field.type === 'select'"
        :model-value="getValue(field.prop)"
        :multiple="field.multiple || false"
        :placeholder="field.placeholder"
        style="width: 100%"
        @update:model-value="(value) => setValue(field.prop, value)"
      >
        <el-option
          v-for="option in field.options || []"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-input-number
        v-else-if="field.type === 'number'"
        :model-value="getValue(field.prop)"
        :min="field.min ?? 0"
        style="width: 100%"
        @update:model-value="(value) => setValue(field.prop, value)"
      />
      <el-switch
        v-else-if="field.type === 'switch'"
        :model-value="getValue(field.prop)"
        @update:model-value="(value) => setValue(field.prop, value)"
      />
    </el-form-item>
  </template>
</template>

<script>
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
  name: "SchemaFormFields",
  props: {
    fields: {
      type: Array,
      default: () => [],
    },
    form: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const getValue = (prop) => getByPath(props.form, prop);
    const setValue = (prop, value) => setByPath(props.form, prop, value);

    return {
      getValue,
      setValue,
    };
  },
};
</script>
