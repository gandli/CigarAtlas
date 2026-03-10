# CigarAtlas 微信小程序

雪茄爱好者的品鉴、社交与管理平台。

## 功能模块

### 1. 首页 (pages/index)
- 推荐雪茄展示
- 最近品鉴记录
- 即将举行的聚会活动
- 热门话题

### 2. 品鉴记录 (pages/journal)
- 品鉴笔记列表
- 按分类筛选（全部/我的/关注）
- 创建新的品鉴记录
- 点赞和评论功能

### 3. 社交圈子 (pages/social)
- 话题讨论区
- 热门/最新/关注切换
- 发起新话题

### 4. 本地聚会 (pages/meetup)
- 活动列表
- 活动报名
- 发起活动

### 5. 雪茄柜 (pages/humidor)
- 个人雪茄收藏管理
- 统计信息展示
- 添加/编辑雪茄

## 技术栈

- 微信小程序原生开发
- 云开发支持
- 组件化设计

## 目录结构

```
miniprogram/
├── app.js              # 应用入口
├── app.json            # 应用配置
├── app.wxss            # 全局样式
├── sitemap.json        # 站点地图
├── pages/              # 页面
│   ├── index/          # 首页
│   ├── journal/        # 品鉴记录
│   ├── social/         # 社交圈子
│   ├── meetup/         # 本地聚会
│   └── humidor/        # 雪茄柜
├── components/         # 组件
│   ├── cigar-card/     # 雪茄卡片组件
│   ├── loading/        # 加载组件
│   └── empty-state/    # 空状态组件
└── assets/             # 资源文件
    ├── icons/          # 图标
    └── images/         # 图片
```

## 开发指南

### 环境准备

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小程序账号，获取 AppID
3. 将 `project.config.json` 中的 `appid` 替换为你的 AppID

### 运行项目

1. 使用微信开发者工具打开项目根目录
2. 等待编译完成
3. 在模拟器或真机预览

### 配置云开发

如需使用云开发功能：

1. 在微信开发者工具中开通云开发
2. 创建 `cloudfunctions/` 目录
3. 部署云函数

## 设计规范

### 配色方案

- 主色调: `#c9a86c` (金色)
- 背景色: `#0d0d0d` (深黑)
- 卡片背景: `#242424`
- 文字主色: `#ffffff`
- 文字次色: `#888888`

### 设计特点

- 深色主题，符合雪茄文化氛围
- 简洁现代的UI设计
- 流畅的交互体验

## License

MIT