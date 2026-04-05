<template>
  <div class="profile-container">
    <vab-page-header description="维护当前登录用户的个人信息、安全设置和双重认证状态" :icon="['fas', 'user-circle']" title="个人中心" />

    <el-row :gutter="20">
      <el-col :lg="16" :md="24" :sm="24" :xl="16" :xs="24">
        <el-card shadow="never">
          <template #header>
            <span>基本资料</span>
          </template>
          <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="90px" style="max-width: 720px">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="profileForm.bio" :rows="4" type="textarea" />
            </el-form-item>
            <el-form-item label="头像">
              <el-upload :action="uploadAction" :headers="uploadHeaders" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeImageUpload">
                <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar-preview" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button :loading="savingProfile" type="primary" @click="saveProfile">保存资料</el-button>
              <el-button @click="fetchProfile">重载</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :lg="8" :md="24" :sm="24" :xl="8" :xs="24">
        <el-card shadow="never">
          <template #header>
            <span>账户概览</span>
          </template>
          <div class="summary-item">
            <div class="summary-label">当前用户</div>
            <div class="summary-value">{{ profileForm.username || "-" }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">昵称</div>
            <div class="summary-value">{{ profileForm.nickname || "-" }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">邮箱</div>
            <div class="summary-value">{{ profileForm.email || "-" }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">双重认证</div>
            <div class="summary-value">{{ profileForm.googleBound ? "已绑定" : "未绑定" }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">角色</div>
            <div class="summary-value">{{ roleText }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">权限数量</div>
            <div class="summary-value">{{ profileForm.permissionCodes.length }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">创建时间</div>
            <div class="summary-value">{{ formatDateTime(profileForm.createdAt) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">更新时间</div>
            <div class="summary-value">{{ formatDateTime(profileForm.updatedAt) }}</div>
          </div>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <span>Google 双重认证</span>
          </template>
          <div v-if="profileForm.googleBound" class="twofa-status">
            当前账户已绑定 Google Authenticator。
          </div>
          <div v-else class="twofa-status">
            当前账户尚未绑定 Google Authenticator。
          </div>

          <div v-if="qrCodeBase64 && !profileForm.googleBound" class="qr-box">
            <img :src="qrCodeBase64" alt="Google QR Code" class="qr-image" />
            <div class="secret-text">密钥：{{ googleSecret }}</div>
          </div>

          <el-input v-model="googleCode" placeholder="请输入 6 位验证码" style="margin-top: 12px" />
          <div class="action-row">
            <el-button v-if="!profileForm.googleBound" :loading="generatingGoogle" @click="generateGoogleQr">生成二维码</el-button>
            <el-button v-if="!profileForm.googleBound" :loading="bindingGoogle" type="primary" @click="bindGoogle">确认绑定</el-button>
            <el-button v-if="profileForm.googleBound" :loading="unbindingGoogle" type="danger" @click="unbindGoogle">解除绑定</el-button>
          </div>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <span>密码安全</span>
          </template>
          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input v-model="passwordForm.currentPassword" show-password type="password" />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" show-password type="password" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" show-password type="password" />
            </el-form-item>
            <el-form-item>
              <el-button :loading="changingPassword" type="primary" @click="submitPasswordChange">修改密码</el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import VabPageHeader from "@/components/VabPageHeader";
import { bindGoogleAuth, changePassword, getProfile, setupGoogleAuth, unbindGoogleAuth, updateProfile } from "@/api/user";
import { publicUploadEndpoint, uploadHeaders as buildUploadHeaders } from "@/api/systemSettings";

export default {
  name: "PersonalCenter",
  components: {
    VabPageHeader,
    Plus,
  },
  data() {
    return {
      savingProfile: false,
      generatingGoogle: false,
      bindingGoogle: false,
      unbindingGoogle: false,
      changingPassword: false,
      qrCodeBase64: "",
      googleSecret: "",
      googleCode: "",
      profileForm: {
        username: "",
        nickname: "",
        phone: "",
        email: "",
        avatar: "",
        bio: "",
        googleBound: false,
        roles: [],
        permissionCodes: [],
        createdAt: "",
        updatedAt: "",
      },
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      profileRules: {
        nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
        email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }],
      },
      passwordRules: {
        currentPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, message: "新密码至少 6 位", trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, message: "请再次输入新密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordForm.newPassword) callback(new Error("两次输入的新密码不一致"));
              else callback();
            },
            trigger: "blur",
          },
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
    roleText() {
      return this.profileForm.roles.length ? this.profileForm.roles.join(" / ") : "-";
    },
  },
  created() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      const { data } = await getProfile();
      this.profileForm = {
        username: data.username || "",
        nickname: data.nickname || "",
        phone: data.phone || "",
        email: data.email || "",
        avatar: data.avatar || "",
        bio: data.bio || "",
        googleBound: !!data.googleBound,
        roles: data.roles || [],
        permissionCodes: data.permissionCodes || [],
        createdAt: data.createdAt || "",
        updatedAt: data.updatedAt || "",
      };
      if (this.profileForm.googleBound) {
        this.qrCodeBase64 = "";
        this.googleSecret = "";
      }
    },
    beforeImageUpload(file) {
      const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) ElMessage.error("仅支持 JPG/PNG/WebP 图片");
      if (!isLt2M) ElMessage.error("图片大小不能超过 2MB");
      return isImage && isLt2M;
    },
    handleAvatarSuccess(response) {
      if (response.code === 200 && response.data?.downloadUrl) {
        this.profileForm.avatar = response.data.downloadUrl;
        ElMessage.success("头像上传成功");
      } else {
        ElMessage.error(response.msg || "头像上传失败");
      }
    },
    async saveProfile() {
      const valid = await this.$refs.profileFormRef.validate().catch(() => false);
      if (!valid) return;
      this.savingProfile = true;
      try {
        await updateProfile({
          nickname: this.profileForm.nickname,
          phone: this.profileForm.phone,
          email: this.profileForm.email,
          avatar: this.profileForm.avatar,
          bio: this.profileForm.bio,
        });
        await this.$store.dispatch("user/getUserInfo");
        await this.fetchProfile();
        ElMessage.success("个人资料保存成功");
      } finally {
        this.savingProfile = false;
      }
    },
    formatDateTime(value) {
      if (!value) return "-";
      return new Date(value).toLocaleString("zh-CN", { hour12: false });
    },
    resetPasswordForm() {
      this.passwordForm = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      this.$refs.passwordFormRef?.clearValidate();
    },
    async submitPasswordChange() {
      const valid = await this.$refs.passwordFormRef.validate().catch(() => false);
      if (!valid) return;
      this.changingPassword = true;
      try {
        await changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
        });
        this.resetPasswordForm();
        ElMessage.success("密码修改成功，请使用新密码重新登录");
      } finally {
        this.changingPassword = false;
      }
    },
    async generateGoogleQr() {
      this.generatingGoogle = true;
      try {
        const { data } = await setupGoogleAuth();
        this.qrCodeBase64 = data.qrCodeBase64;
        this.googleSecret = data.secret;
        ElMessage.success("二维码生成成功");
      } finally {
        this.generatingGoogle = false;
      }
    },
    async bindGoogle() {
      if (!this.googleCode) {
        ElMessage.error("请输入验证码");
        return;
      }
      this.bindingGoogle = true;
      try {
        await bindGoogleAuth({ code: this.googleCode });
        this.googleCode = "";
        this.qrCodeBase64 = "";
        this.googleSecret = "";
        await this.fetchProfile();
        ElMessage.success("双重认证绑定成功");
      } finally {
        this.bindingGoogle = false;
      }
    },
    async unbindGoogle() {
      if (!this.googleCode) {
        ElMessage.error("请输入验证码");
        return;
      }
      this.unbindingGoogle = true;
      try {
        await unbindGoogleAuth({ code: this.googleCode });
        this.googleCode = "";
        await this.fetchProfile();
        ElMessage.success("双重认证已解绑");
      } finally {
        this.unbindingGoogle = false;
      }
    },
  },
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.avatar-preview {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 12px;
}

.avatar-uploader-icon {
  width: 96px;
  height: 96px;
  border: 1px dashed #dcdfe6;
  border-radius: 12px;
}

.summary-item {
  margin-bottom: 16px;
}

.summary-label {
  font-size: 12px;
  color: #909399;
}

.summary-value {
  margin-top: 4px;
  font-size: 15px;
  color: #303133;
}

.twofa-status {
  color: #606266;
  line-height: 1.7;
}

.qr-box {
  margin-top: 16px;
  text-align: center;
}

.qr-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
}

.secret-text {
  margin-top: 12px;
  word-break: break-all;
  color: #606266;
}

.action-row {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
</style>
