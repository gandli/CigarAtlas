# Humidor API 文档

雪茄柜（Humidor）管理 API - 提供完整的增删改查功能

## 基础信息

- **Base URL**: `http://localhost:8787/v1` (开发环境)
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 认证

所有 Humidor 端点都需要认证。在请求头中添加：

```
Authorization: Bearer <your-jwt-token>
```

开发环境可以使用以下头绕过认证：
```
X-Dev-User-Id: <user-id>
```

---

## 端点列表

### 1. 获取雪茄柜列表

**GET** `/v1/humidors`

获取当前用户的所有雪茄柜（包含统计信息）

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "mmvfwff4yyqnzdhl4",
      "user_id": "test-user-123",
      "name": "我的雪茄柜",
      "type": "cooler",
      "description": "测试雪茄柜",
      "target_temperature_min": 16,
      "target_temperature_max": 18,
      "target_humidity_min": 65,
      "target_humidity_max": 70,
      "image_url": null,
      "capacity": 50,
      "is_default": 1,
      "created_at": "2026-03-18T02:46:20.176Z",
      "updated_at": "2026-03-18T02:46:20.176Z",
      "cigar_count": 0,
      "total_quantity": 0,
      "latest_temperature": null,
      "latest_humidity": null,
      "latest_log_at": null
    }
  ]
}
```

---

### 2. 获取雪茄柜摘要列表

**GET** `/v1/humidors/summary`

获取当前用户的所有雪茄柜摘要（轻量版本）

---

### 3. 获取单个雪茄柜详情

**GET** `/v1/humidors/:id`

**路径参数**:
- `id` (string): 雪茄柜 ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "mmvfwff4yyqnzdhl4",
    "user_id": "test-user-123",
    "name": "我的雪茄柜",
    "type": "cooler",
    "description": "测试雪茄柜",
    "target_temperature_min": 16,
    "target_temperature_max": 18,
    "target_humidity_min": 65,
    "target_humidity_max": 70,
    "image_url": null,
    "capacity": 50,
    "is_default": 1,
    "created_at": "2026-03-18T02:46:20.176Z",
    "updated_at": "2026-03-18T02:46:20.176Z"
  }
}
```

---

### 4. 获取雪茄柜详细摘要

**GET** `/v1/humidors/:id/summary`

获取单个雪茄柜的详细摘要（包含统计信息）

---

### 5. 创建雪茄柜

**POST** `/v1/humidors`

**请求体**:
```json
{
  "name": "我的雪茄柜",           // 必填，1-100 字符
  "type": "cooler",               // 可选，默认 "cabinet"
  "description": "测试雪茄柜",     // 可选，最大 500 字符
  "target_temperature_min": 16,   // 可选，默认 16，范围 -10~50
  "target_temperature_max": 18,   // 可选，默认 18，范围 -10~50
  "target_humidity_min": 65,      // 可选，默认 65，范围 0~100
  "target_humidity_max": 70,      // 可选，默认 70，范围 0~100
  "capacity": 50                  // 可选，非负整数
}
```

**type 可选值**:
- `cabinet` - 雪茄柜
- `cooler` - 冷藏柜
- `desktop` - 桌面盒
- `travel` - 旅行盒

**响应示例** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "mmvfwff4yyqnzdhl4",
    "user_id": "test-user-123",
    "name": "我的雪茄柜",
    "type": "cooler",
    "description": "测试雪茄柜",
    "target_temperature_min": 16,
    "target_temperature_max": 18,
    "target_humidity_min": 65,
    "target_humidity_max": 70,
    "image_url": null,
    "capacity": 50,
    "is_default": 1,
    "created_at": "2026-03-18T02:46:20.184Z",
    "updated_at": "2026-03-18T02:46:20.184Z"
  }
}
```

**业务逻辑**:
- 用户的第一个雪茄柜自动设为默认 (`is_default: 1`)
- `cabinet` 类型的雪茄柜优先作为默认

---

### 6. 更新雪茄柜（全量更新）

**PUT** `/v1/humidors/:id`

**请求体**: 所有字段可选
```json
{
  "name": "更新后的雪茄柜",
  "type": "cabinet",
  "description": "新描述",
  "target_temperature_min": 17,
  "target_temperature_max": 19,
  "target_humidity_min": 60,
  "target_humidity_max": 75,
  "image_url": "https://example.com/image.jpg",
  "capacity": 100,
  "is_default": true
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "mmvfwff4yyqnzdhl4",
    "user_id": "test-user-123",
    "name": "更新后的雪茄柜",
    "type": "cabinet",
    ...
  }
}
```

**业务逻辑**:
- 设置 `is_default: true` 时，会自动取消用户其他雪茄柜的默认状态

---

### 7. 更新雪茄柜（部分更新）

**PATCH** `/v1/humidors/:id`

与 PUT 相同，但只更新提供的字段。

**示例** - 只更新描述:
```json
{
  "description": "使用 PATCH 更新描述"
}
```

---

### 8. 删除雪茄柜

**DELETE** `/v1/humidors/:id`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "Humidor deleted successfully"
  }
}
```

**注意**: 删除雪茄柜会级联删除相关的雪茄记录、环境日志和提醒。

---

## 错误响应

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header. Use: Bearer <token>"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this humidor"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Humidor not found"
  }
}
```

### 400 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      },
      {
        "field": "type",
        "message": "Invalid enum value. Expected 'cabinet' | 'cooler' | 'desktop' | travel', received 'invalid'"
      }
    ]
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to retrieve humidors"
  }
}
```

---

## 测试示例

### 创建雪茄柜
```bash
curl -X POST http://localhost:8787/v1/humidors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"name":"我的雪茄柜","type":"cooler"}'
```

### 获取列表
```bash
curl http://localhost:8787/v1/humidors \
  -H "Authorization: Bearer test-token"
```

### 获取详情
```bash
curl http://localhost:8787/v1/humidors/<id> \
  -H "Authorization: Bearer test-token"
```

### 更新雪茄柜
```bash
curl -X PUT http://localhost:8787/v1/humidors/<id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"name":"更新后的名称","target_temperature_min":17}'
```

### 删除雪茄柜
```bash
curl -X DELETE http://localhost:8787/v1/humidors/<id> \
  -H "Authorization: Bearer test-token"
```

---

## 文件结构

```
src/
├── routes/
│   └── humidors.ts          # 路由处理器
├── db/
│   └── humidors.ts          # 数据库操作
├── validators/
│   └── humidor.ts           # 验证 Schema
└── utils/
    └── validation.ts        # 验证工具函数
```

---

## 实现日期

2026-03-18
