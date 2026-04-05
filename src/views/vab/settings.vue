<template>
  <div class="settings-container">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="120px" style="max-width: 640px">
            <el-form-item label="网站名称" prop="siteName">
              <el-input v-model="basicForm.siteName" />
            </el-form-item>
            <el-form-item label="网站描述" prop="description">
              <el-input v-model="basicForm.description" :rows="3" type="textarea" />
            </el-form-item>
            <el-form-item label="网站 Logo">
              <el-upload :action="uploadAction" :headers="uploadHeaders" :show-file-list="false" :on-success="handleLogoSuccess" :before-upload="beforeImageUpload">
                <img v-if="basicForm.logo" :src="basicForm.logo" class="avatar" alt="Logo" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button :loading="saving.basic" type="primary" @click="saveBasicSettings">保存设置</el-button>
              <el-button @click="loadBasicSettings">重载</el-button>
            </el-form-item>
          </el-form>
          <el-divider content-position="left">站点预览</el-divider>
          <div class="site-preview">
            <div class="site-preview__header">
              <img v-if="basicForm.logo" :src="basicForm.logo" alt="logo" class="site-preview__logo" />
              <div v-else class="site-preview__logo site-preview__logo--placeholder">Logo</div>
              <div class="site-preview__meta">
                <div class="site-preview__title">{{ basicForm.siteName || "Admin Demo" }}</div>
                <div class="site-preview__desc">{{ basicForm.description || "可复用后台管理系统基座" }}</div>
              </div>
            </div>
            <el-alert
              :closable="false"
              title="当前站点配置预览"
              type="success"
              show-icon
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <el-form ref="securityFormRef" :model="securityForm" :rules="securityRules" label-width="150px" style="max-width: 640px">
            <el-form-item label="密码最小长度" prop="minPasswordLength">
              <el-input-number v-model="securityForm.minPasswordLength" :max="20" :min="6" />
            </el-form-item>
            <el-form-item label="启用登录验证码">
              <el-switch v-model="securityForm.loginCaptcha" />
            </el-form-item>
            <el-form-item label="启用双重认证">
              <el-switch v-model="securityForm.twoFactorAuth" />
            </el-form-item>
            <el-form-item label="会话超时(分钟)" prop="sessionTimeout">
              <el-input-number v-model="securityForm.sessionTimeout" :max="1440" :min="1" />
            </el-form-item>
            <el-form-item label="登录失败次数" prop="maxLoginAttempts">
              <el-input-number v-model="securityForm.maxLoginAttempts" :max="10" :min="1" />
            </el-form-item>
            <el-form-item>
              <el-button :loading="saving.security" type="primary" @click="saveSecuritySettings">保存设置</el-button>
              <el-button @click="loadSecuritySettings">重载</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="邮件设置" name="email">
          <el-form ref="emailFormRef" :model="emailForm" :rules="emailRules" label-width="120px" style="max-width: 640px">
            <el-form-item label="SMTP 服务器" prop="smtpServer">
              <el-input v-model="emailForm.smtpServer" />
            </el-form-item>
            <el-form-item label="SMTP 端口" prop="smtpPort">
              <el-input-number v-model="emailForm.smtpPort" :max="65535" :min="1" />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input v-model="emailForm.username" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="emailForm.password" show-password type="password" />
            </el-form-item>
            <el-form-item label="发件邮箱" prop="senderEmail">
              <el-input v-model="emailForm.senderEmail" />
            </el-form-item>
            <el-form-item>
              <el-button :loading="saving.email" type="primary" @click="saveEmailSettings">保存设置</el-button>
              <el-button @click="loadEmailSettings">重载</el-button>
              <el-button :loading="testingEmail" @click="testEmailConnection">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  buildSettingsPayload,
  fetchSettingsByGroup,
  publicUploadEndpoint,
  saveSettings,
  uploadHeaders as buildUploadHeaders,
} from "@/api/systemSettings";
import { applySiteSettings } from "@/utils/siteSettings";

export default {
  name: "Settings",
  components: {
    Plus,
  },
  data() {
    return {
      activeTab: "basic",
      testingEmail: false,
      saving: {
        basic: false,
        security: false,
        email: false,
      },
      basicConfigMeta: {},
      securityConfigMeta: {},
      emailConfigMeta: {},
      basicForm: {
        siteName: "",
        description: "",
        logo: "",
      },
      securityForm: {
        minPasswordLength: 8,
        loginCaptcha: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
      },
      emailForm: {
        smtpServer: "",
        smtpPort: 587,
        username: "",
        password: "",
        senderEmail: "",
      },
      basicRules: {
        siteName: [{ required: true, message: "请输入网站名称", trigger: "blur" }],
        description: [{ required: true, message: "请输入网站描述", trigger: "blur" }],
      },
      securityRules: {
        minPasswordLength: [{ required: true, message: "请输入密码最小长度", trigger: "blur" }],
        sessionTimeout: [{ required: true, message: "请输入会话超时时间", trigger: "blur" }],
        maxLoginAttempts: [{ required: true, message: "请输入登录失败尝试次数", trigger: "blur" }],
      },
      emailRules: {
        smtpServer: [{ required: true, message: "请输入 SMTP 服务器", trigger: "blur" }],
        smtpPort: [{ required: true, message: "请输入 SMTP 端口", trigger: "blur" }],
        username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        senderEmail: [
          { required: true, message: "请输入发件人邮箱", trigger: "blur" },
          { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    uploadAction() {
      return publicUploadEndpoint();
    },
    uploadHeaders() {
      return buildUploadHeaders();
    },
  },
  created() {
    this.loadAllSettings();
  },
  methods: {
    beforeImageUpload(file) {
      const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) ElMessage.error("Logo 图片仅支持 JPG/PNG/WebP");
      if (!isLt2M) ElMessage.error("Logo 图片大小不能超过 2MB");
      return isImage && isLt2M;
    },
    handleLogoSuccess(response) {
      if (response.code === 200 && response.data?.downloadUrl) {
        this.basicForm.logo = response.data.downloadUrl;
        ElMessage.success("Logo 上传成功");
      } else {
        ElMessage.error(response.msg || "Logo 上传失败");
      }
    },
    async loadAllSettings() {
      await Promise.all([this.loadBasicSettings(), this.loadSecuritySettings(), this.loadEmailSettings()]);
    },
    async loadBasicSettings() {
      this.basicConfigMeta = await fetchSettingsByGroup("site");
      this.basicForm = {
        siteName: this.basicConfigMeta["site.title"]?.configValue || "",
        description: this.basicConfigMeta["site.description"]?.configValue || "",
        logo: this.basicConfigMeta["site.logo"]?.configValue || "",
      };
      applySiteSettings(this.basicForm);
    },
    async loadSecuritySettings() {
      this.securityConfigMeta = await fetchSettingsByGroup("security");
      this.securityForm = {
        minPasswordLength: Number(this.securityConfigMeta["security.password_min_length"]?.configValue || 8),
        loginCaptcha: toBooleanSetting(this.securityConfigMeta["security.login_captcha"]?.configValue),
        twoFactorAuth: toBooleanSetting(this.securityConfigMeta["security.two_factor_auth"]?.configValue),
        sessionTimeout: Number(this.securityConfigMeta["security.session_timeout"]?.configValue || 30),
        maxLoginAttempts: Number(this.securityConfigMeta["security.max_login_attempts"]?.configValue || 5),
      };
    },
    async loadEmailSettings() {
      this.emailConfigMeta = await fetchSettingsByGroup("email");
      this.emailForm = {
        smtpServer: this.emailConfigMeta["email.smtp_server"]?.configValue || "",
        smtpPort: Number(this.emailConfigMeta["email.smtp_port"]?.configValue || 587),
        username: this.emailConfigMeta["email.username"]?.configValue || "",
        password: this.emailConfigMeta["email.password"]?.configValue || "",
        senderEmail: this.emailConfigMeta["email.sender_email"]?.configValue || "",
      };
    },
    async saveBasicSettings() {
      const valid = await this.$refs.basicFormRef.validate().catch(() => false);
      if (!valid) return;
      this.saving.basic = true;
      try {
        await saveSettings(
          buildSettingsPayload(this.basicConfigMeta, {
            "site.title": this.basicForm.siteName,
            "site.description": this.basicForm.description,
            "site.logo": this.basicForm.logo,
          })
        );
        await this.loadBasicSettings();
        applySiteSettings({
          siteName: this.basicForm.siteName,
          description: this.basicForm.description,
          logo: this.basicForm.logo,
        });
        document.title = this.basicForm.siteName;
        ElMessage.success("基本设置保存成功");
      } finally {
        this.saving.basic = false;
      }
    },
    async saveSecuritySettings() {
      const valid = await this.$refs.securityFormRef.validate().catch(() => false);
      if (!valid) return;
      this.saving.security = true;
      try {
        await saveSettings(
          buildSettingsPayload(this.securityConfigMeta, {
            "security.password_min_length": this.securityForm.minPasswordLength,
            "security.login_captcha": this.securityForm.loginCaptcha,
            "security.two_factor_auth": this.securityForm.twoFactorAuth,
            "security.session_timeout": this.securityForm.sessionTimeout,
            "security.max_login_attempts": this.securityForm.maxLoginAttempts,
          })
        );
        await this.loadSecuritySettings();
        ElMessage.success("安全设置保存成功");
      } finally {
        this.saving.security = false;
      }
    },
    async saveEmailSettings() {
      const valid = await this.$refs.emailFormRef.validate().catch(() => false);
      if (!valid) return;
      this.saving.email = true;
      try {
        await saveSettings(
          buildSettingsPayload(this.emailConfigMeta, {
            "email.smtp_server": this.emailForm.smtpServer,
            "email.smtp_port": this.emailForm.smtpPort,
            "email.username": this.emailForm.username,
            "email.password": this.emailForm.password,
            "email.sender_email": this.emailForm.senderEmail,
          })
        );
        await this.loadEmailSettings();
        ElMessage.success("邮件设置保存成功");
      } finally {
        this.saving.email = false;
      }
    },
    async testEmailConnection() {
      const valid = await this.$refs.emailFormRef.validate().catch(() => false);
      if (!valid) return;
      this.testingEmail = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        ElMessage.success("邮件配置格式校验通过，可继续接入真实发信服务");
      } finally {
        this.testingEmail = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 20px;

  :deep(.el-tabs__content) {
    padding: 20px 0;
  }

  .avatar {
    width: 120px;
    height: 120px;
    display: block;
    object-fit: cover;
    border-radius: 12px;
  }
}

.avatar-uploader-icon {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 12px;
}

.site-preview {
  max-width: 640px;
}

.site-preview__header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
}

.site-preview__logo {
  display: flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  object-fit: cover;
  border-radius: 14px;
  background: var(--el-fill-color-light);
}

.site-preview__logo--placeholder {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.site-preview__title {
  font-size: 18px;
  font-weight: 600;
}

.site-preview__desc {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}
</style>
