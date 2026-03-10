# CigarAtlas HarmonyOS App

## 项目结构

```
harmony/
├── app.json5                          # 应用配置
├── build-profile.json5                # 构建配置
├── oh-package.json5                    # 包配置
├── entry/                              # 入口模块
│   ├── src/main/
│   │   ├── ets/
│   │   │   ├── entryAbility.ets       # 应用入口
│   │   │   ├── pages/                 # 页面
│   │   │   │   ├── IndexPage.ets      # 首页（Tab导航）
│   │   │   │   ├── JournalPage.ets    # 品鉴记录
│   │   │   │   ├── SocialPage.ets     # 社交圈子
│   │   │   │   ├── MeetupPage.ets     # 本地聚会
│   │   │   │   └── HumidorPage.ets    # 雪茄柜
│   │   │   ├── components/            # 组件
│   │   │   ├── model/                 # 数据模型
│   │   │   │   └── index.ets
│   │   │   └── utils/                 # 工具类
│   │   │       ├── http.ets           # HTTP请求
│   │   │       ├── storage.ets        # 本地存储
│   │   │       ├── date.ets           # 日期工具
│   │   │       └── index.ets
│   │   ├── resources/
│   │   │   └── base/
│   │   │       ├── element/
│   │   │       │   ├── string.json    # 字符串资源
│   │   │       │   └── color.json     # 颜色资源
│   │   │       ├── media/             # 图片资源
│   │   │       └── profile/
│   │   │           └── main_pages.json # 页面路由
│   │   └── module.json5               # 模块配置
│   └── build-profile.json5            # 模块构建配置
└── hvigorfile.ts                      # 构建脚本
```

## 功能模块

### 1. 首页 (IndexPage)
- 精选雪茄推荐
- 搜索功能
- 发现附近雪茄店

### 2. 品鉴记录 (JournalPage)
- 记录品鉴体验
- 评分系统
- 风味标签

### 3. 社交圈子 (SocialPage)
- 发帖分享
- 点赞评论
- 关注互动

### 4. 本地聚会 (MeetupPage)
- 发现聚会活动
- 报名参加
- 创建聚会

### 5. 雪茄柜 (HumidorPage)
- 管理收藏
- 库存统计
- 存储状态追踪

## 技术栈

- **语言**: ArkTS (TypeScript 扩展)
- **框架**: HarmonyOS ArkUI
- **架构**: MVVM
- **UI组件**: 原生 ArkUI 组件

## 开发环境

- DevEco Studio 4.0+
- HarmonyOS SDK API 10+
- Node.js 14+

## 构建与运行

1. 使用 DevEco Studio 打开 `harmony` 目录
2. 同步项目依赖
3. 连接 HarmonyOS 设备或启动模拟器
4. 点击运行按钮

## 注意事项

- 本项目为 HarmonyOS 原生应用
- 需要在真实的 HarmonyOS 设备或模拟器上运行
- 图片资源需要自行添加到 `resources/base/media/` 目录

## License

MIT