# CigarAtlas MVP 设计文档

**日期**: 2026-03-04  
**状态**: 已确认  
**版本**: v1.0

---

## 1. 产品定位

**一句话描述**：雪茄爱好者的养护工具 + 社区平台

**策略**：工具优先 → 建立信任 → 沉淀社区

**切入点**：以"养护工具"为抓手，解决用户真实痛点，建立使用习惯和信任，后续再引入鉴定工具和社区功能。

---

## 2. 目标用户

- **核心用户**：国内雪茄爱好者（30-50岁男性为主）
- **痛点**：
  - 养护知识分散，不知道怎么存
  - 假货风险，不敢买
  - 社区分散在微信群，缺乏专业平台

---

## 3. 技术选型

| 层级 | 技术方案 | 理由 |
|------|---------|------|
| 前端 | Swift + SwiftUI + iOS 17+ | 原生体验，SwiftUI 开发效率高 |
| 后端 | Cloudflare Workers | Serverless，零运维，免费额度够 MVP |
| 数据库 | Cloudflare D1 | SQLite 兼容，与 Workers 无缝集成 |
| 存储 | Cloudflare R2 | 10GB 免费，零流量费 |
| 认证 | Apple Sign In | iOS 必须提供，免费，隐私友好 |
| 推送 | APNs (本地推送) | 提醒功能 |

---

## 4. 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    iOS App (Swift/SwiftUI)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
│  │ 首页概览 │ │雪茄柜   │ │ 记录    │ │ 个人中心    │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘   │
└───────┼──────────┼──────────┼───────────────┼──────────┘
        │          │          │               │
        └──────────┴──────────┴───────────────┘
                           │
                    ┌──────▼──────┐
                    │  Cloudflare │
                    │   Workers   │
                    │   (API)     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐     ┌──────▼──────┐    ┌──────▼──────┐
  │ D1 数据库 │     │ R2 存储     │    │ 推送服务    │
  │ (SQLite)  │     │ (图片)      │    │ (APNs)      │
  └───────────┘     └─────────────┘    └─────────────┘
```

---

## 5. 数据模型

### 5.1 User（用户）

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  apple_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  nickname TEXT,
  avatar_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 Humidor（雪茄柜）

```sql
CREATE TABLE humidors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 Cigar（雪茄）

```sql
CREATE TABLE cigars (
  id TEXT PRIMARY KEY,
  humidor_id TEXT NOT NULL REFERENCES humidors(id),
  brand TEXT NOT NULL,
  line TEXT,
  size TEXT,
  quantity INTEGER DEFAULT 1,
  purchase_date TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 5.4 EnvironmentLog（温湿度记录）

```sql
CREATE TABLE environment_logs (
  id TEXT PRIMARY KEY,
  humidor_id TEXT NOT NULL REFERENCES humidors(id),
  temperature REAL NOT NULL,
  humidity REAL NOT NULL,
  logged_at TEXT NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 5.5 Reminder（提醒）

```sql
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  humidor_id TEXT NOT NULL REFERENCES humidors(id),
  type TEXT NOT NULL, -- 'check_temp', 'rotate', 'smoke'
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  next_at TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. API 端点

### 基础路径
```
https://api.cigaratlas.com/v1
```

### 认证
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /auth/apple | Apple Sign In 登录 |
| POST | /auth/refresh | 刷新 Token |
| POST | /auth/logout | 登出 |

### 用户
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /users/me | 获取当前用户 |
| PATCH | /users/me | 更新用户资料 |

### 雪茄柜
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /humidors | 获取雪茄柜列表 |
| POST | /humidors | 创建雪茄柜 |
| GET | /humidors/:id | 获取雪茄柜详情 |
| PATCH | /humidors/:id | 更新雪茄柜 |
| DELETE | /humidors/:id | 删除雪茄柜 |

### 雪茄
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /humidors/:id/cigars | 获取雪茄列表 |
| POST | /cigars | 添加雪茄 |
| PATCH | /cigars/:id | 更新雪茄 |
| DELETE | /cigars/:id | 删除雪茄 |

### 温湿度记录
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /humidors/:id/logs | 获取记录列表 |
| POST | /humidors/:id/logs | 添加记录 |
| GET | /humidors/:id/stats | 获取统计数据 |

### 提醒
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /humidors/:id/reminders | 获取提醒列表 |
| POST | /humidors/:id/reminders | 创建提醒 |
| PATCH | /reminders/:id | 更新提醒 |
| DELETE | /reminders/:id | 删除提醒 |

### 图片上传
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /upload/presign | 获取 R2 预签名 URL |

---

## 7. iOS App 页面结构

### Tab Bar (4个主标签)

```
┌─────────────────────────────────────────────────────────┐
│  🏠 首页    │  📦 雪茄柜   │  ➕ 记录    │  👤 我的    │
└─────────────────────────────────────────────────────────┘
```

### 首页 (HomeView)
- 概览卡片：库存总数、待处理提醒、温湿度趋势
- 快捷操作：记录温湿度、添加雪茄
- 最近动态：最近添加/品吸的雪茄

### 雪茄柜 (HumidorsView)
- 雪茄柜列表
- 雪茄柜详情：温湿度历史、雪茄列表、提醒设置
- 雪茄详情：图片、品牌信息、养护天数、备注

### 记录 (RecordView)
- 添加温湿度记录
- 添加雪茄

### 我的 (ProfileView)
- 个人资料
- 设置
- 统计

---

## 8. MVP 功能范围

### ✅ 包含 (P0)

| 功能 | 优先级 |
|------|--------|
| Apple Sign In 登录 | P0 |
| 雪茄柜管理（创建/编辑/删除） | P0 |
| 温湿度手动记录 | P0 |
| 温湿度历史曲线 | P0 |
| 雪茄添加/编辑/删除 | P0 |
| 雪茄图片上传 | P0 |
| 养护提醒（本地推送） | P0 |
| 首页概览 | P0 |
| 个人资料 | P0 |

### ❌ 不包含 (MVP 后)

- 社区功能（帖子/评论/点赞）
- IoT 设备自动采集
- 鉴定工具
- 在线交易/支付
- AI 自动鉴定

---

## 9. 开发计划（4周）

### Week 1: 基础架构

| 天数 | 任务 |
|------|------|
| Day 1-2 | Cloudflare Workers 项目搭建、D1 Schema、R2 配置 |
| Day 3-4 | iOS Xcode 项目创建、SwiftUI 基础结构、网络层 |
| Day 5-7 | Apple Sign In 集成（前端 + 后端） |

### Week 2: 核心功能

| 天数 | 任务 |
|------|------|
| Day 1-2 | 雪茄柜管理（列表、创建、编辑、API 对接） |
| Day 3-4 | 温湿度记录（记录页、历史图表、API 对接） |
| Day 5-7 | 雪茄管理（添加、编辑、图片上传、API 对接） |

### Week 3: 提醒 & 完善

| 天数 | 任务 |
|------|------|
| Day 1-3 | 提醒系统（本地推送、管理页、触发逻辑） |
| Day 4-7 | 首页概览、个人中心、边缘情况、内部测试 |

### Week 4: 发布准备

| 天数 | 任务 |
|------|------|
| Day 1-3 | UI 打磨、性能优化、Bug 修复 |
| Day 4-7 | App Store 资料准备、TestFlight 内测、提交审核 |

---

## 10. 待调研事项

1. **智能雪茄柜** - 调研市面上的智能雪茄柜品牌，了解数据传输能力
2. **雪茄品牌数据** - 获取雪茄品牌/型号的基础数据，用于搜索和推荐
3. **合规审查** - 确认 App Store 对烟草相关 App 的审核要求

---

## 11. 风险 & 缓解

| 风险 | 缓解措施 |
|------|---------|
| App Store 审核风险 | 提前研究审核指南，避免烟草销售相关功能 |
| 开发周期延长 | 严格控制 MVP 边界，每周 scope lock |
| 冷启动内容缺失 | 准备种子内容（雪茄品牌数据、养护知识） |
| 用户留存低 | 提醒功能作为留存抓手 |

---

## 附录：决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-03-04 | 工具优先策略 | 养护工具高频使用，建立用户粘性 |
| 2026-03-04 | iOS 原生开发 | 体验最好，SwiftUI 开发效率高 |
| 2026-03-04 | Cloudflare 全家桶 | 免费额度足够 MVP，零运维 |
| 2026-03-04 | Apple Sign In | iOS 必须，免费，隐私友好 |
| 2026-03-04 | 最小可行架构 | 快速验证，后续迭代优化 |