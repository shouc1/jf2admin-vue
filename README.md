# JF2Admin-Vue

一个基于 Vue 3 + Element Plus 的后台管理系统前端项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由
- **Pinia** - Vue 状态管理库
- **Element Plus** - Vue 3 UI 组件库
- **Axios** - HTTP 请求库

## 功能模块

- **登录认证** - 用户登录、Token 管理
- **首页仪表盘** - 数据统计展示
- **成员管理** - 成员信息查看与编辑
- **部门管理** - 部门信息管理
- **管理员管理** - 管理员账号管理、密码重置
- **报告管理** - 报告查看
- **个人中心** - 个人信息管理

## 项目结构

```
jf2admin-vue/
├── public/             # 静态资源
├── src/
│   ├── api/            # API 接口封装
│   ├── components/     # 公共组件
│   ├── router/         # 路由配置
│   ├── store/          # 状态管理
│   ├── styles/         # 全局样式
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件并配置后端 API 地址：

```env
VITE_API_BASE_URL=http://localhost:8080/api/
```

### 开发运行

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 主题配置

项目使用深色主题，主要颜色变量定义在 `src/styles/global.css`：

```css
:root {
  --primary-color: #37ba7d;      /* 主色调 - 绿色 */
  --secondary-color: #1a1a1a;    /* 次要色 - 深黑 */
  --tertiary-color: #2d2d2d;     /* 第三色 - 浅黑 */
  --text-color: #fff;            /* 文字颜色 */
  --border-color: #333;          /* 边框颜色 */
}
```

## API 接口

| 模块 | 接口 | 说明 |
|------|------|------|
| admin | login, logout, token, list, create, reset, delete | 管理员相关 |
| member | list, update | 成员相关 |
| dept | list, update | 部门相关 |
| report | list | 报告相关 |
| edition | list, updateStatus, swapPublish | 版本相关 |

## License

MIT
