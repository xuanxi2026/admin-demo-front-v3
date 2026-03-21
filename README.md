# Admin Demo Front V3

基于 Vue 3 + Element Plus 的后台管理前端模板，对接 Go 语言后端服务。

## 技术栈

- **Vue**: 3.5.30
- **Element Plus**: 2.13.6
- **Vue Router**: 5.0.4
- **Vuex**: 4.1.0
- **Rspack**: 1.7.9
- **Axios**: 1.13.6

## 功能模块

### 系统管理
- 用户管理 - 用户的增删改查、权限分配
- 角色管理 - 角色权限码管理
- 菜单管理 - 系统菜单配置

### 文件管理
- 公开文件区 - 公开访问的文件上传下载
- 私有文件区 - 需要认证的文件管理

### 其他功能
- 登录/注册
- JWT 认证
- Google 双因素认证
- 个人中心

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run serve:rspack
```

默认启动在 http://localhost:8080

### 生产构建

```bash
npm run build
```

## 后端对接

默认对接 `admin-demo-go` 服务：

- 本地开发: http://127.0.0.1:8889/api
- 生产环境: /api

## 项目结构

```
├── src/
│   ├── api/           # API 接口
│   ├── components/    # 公共组件
│   ├── config/        # 配置文件
│   ├── layouts/       # 布局组件
│   ├── plugins/       # 插件
│   ├── router/        # 路由配置
│   ├── store/         # Vuex 状态管理
│   ├── styles/        # 样式文件
│   ├── utils/         # 工具函数
│   └── views/         # 页面视图
│       ├── fileManagement/      # 文件管理
│       ├── personnelManagement/ # 人员管理
│       │   ├── userManagement/  # 用户管理
│       │   ├── roleManagement/  # 角色管理
│       │   └── menuManagement/  # 菜单管理
│       └── ...
├── public/            # 静态资源
└── dist/              # 构建输出
```

## 相关项目

- [admin-demo-front](https://github.com/faker007/admin-demo-front) - Vue 2 版本
- [admin-demo-go](https://github.com/faker007/admin-demo-go) - Go 后端服务

## License

MIT
