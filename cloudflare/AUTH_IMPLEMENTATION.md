# CigarAtlas 认证中间件实现报告

## ✅ 实现的功能

### 1. JWT 工具 (`src/utils/jwt.ts`)

实现了完整的 JWT token 管理功能：

- **`generateAccessToken(userId, secret)`** - 生成访问令牌（1 小时有效期）
- **`generateRefreshToken(userId, secret)`** - 生成刷新令牌（7 天有效期）
- **`generateTokenPair(userId, secret)`** - 同时生成访问令牌和刷新令牌
- **`verifyToken(token, secret)`** - 验证 JWT token
- **`verifyAccessToken(token, secret)`** - 专门验证访问令牌
- **`verifyRefreshToken(token, secret)`** - 专门验证刷新令牌
- **`refreshTokens(refreshToken, secret)`** - 使用刷新令牌获取新的令牌对
- **`extractToken(authHeader)`** - 从 Authorization 头提取 token
- **`extractTokenFromRequest(authHeader, queryToken)`** - 从请求中提取 token（支持 header 和 query 参数）

使用的库：`@tsndr/cloudflare-worker-jwt`（专为 Cloudflare Workers 设计的 JWT 库）

### 2. 认证中间件 (`src/middleware/auth.ts`)

实现了完整的认证中间件和用户管理功能：

- **`authMiddleware`** - JWT 认证中间件，验证 access token 并附加用户 ID 到上下文
- **`optionalAuth`** - 可选认证中间件，token 存在时验证，但不强制要求
- **`requireUser(c)`** - 获取当前认证用户，未认证时抛出错误
- **`getCurrentUserId(c)`** - 获取当前用户 ID（不获取完整用户对象）
- **`getCurrentUser(c)`** - 获取当前用户或 null
- **`rateLimit(limit, windowMs)`** - 简单的内存限速中间件
- **`checkOwnership(c, resourceUserId)`** - 检查资源所有权
- **`requireOwnership(c, resourceUserId)`** - 要求资源所有权

### 3. Apple Sign In 路由 (`src/routes/auth.ts`)

实现了完整的 Apple 登录和 token 管理端点：

#### `POST /v1/auth/apple`
Apple Sign In 端点
- 验证 Apple identity token
- 创建或更新用户账户
- 返回 access token 和 refresh token
- 支持开发模式（使用 `test-token` 进行模拟登录）
- 限速：10 次/分钟

**请求体：**
```json
{
  "identityToken": "apple-identity-token",
  "fullName": {
    "givenName": "John",
    "familyName": "Doe"
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "user-id",
      "apple_id": "apple-subject-id",
      "nickname": "John",
      "avatar_url": null,
      "timezone": "Asia/Shanghai",
      "preferences": null,
      "created_at": "2026-03-18T02:58:29.737Z",
      "updated_at": "2026-03-18T02:58:29.737Z"
    }
  }
}
```

#### `POST /v1/auth/refresh`
刷新 access token
- 使用 refresh token 获取新的 token 对
- 限速：20 次/分钟

**请求体：**
```json
{
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

#### `POST /v1/auth/logout`
用户登出
- 客户端应删除本地存储的 tokens
- 服务端可以记录登出事件（未来可实现 token 黑名单）

**响应：**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

#### `GET /v1/auth/me`
获取当前认证用户信息
- 需要有效的 access token

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "apple_id": "apple-subject-id",
    "nickname": "John",
    "avatar_url": null,
    "timezone": "Asia/Shanghai",
    "preferences": null,
    "created_at": "2026-03-18T02:58:29.737Z",
    "updated_at": "2026-03-18T02:58:29.737Z"
  }
}
```

### 4. 路由保护

已在以下路由添加认证中间件保护：

- **`/v1/humidors/*`** - 所有 humidor 相关路由
- **`/v1/humidors/:id/stats/*`** - 所有统计相关路由
- **`/v1/users/*`** - 所有用户相关路由

## ✅ 测试结果

### 测试环境
- 端口：localhost:8793
- 环境：development
- 数据库：D1 (local)

### 测试用例

#### ✅ Test 1: Apple Sign In
```bash
curl -X POST http://localhost:8793/v1/auth/apple \
  -H "Content-Type: application/json" \
  -d '{"identityToken": "test-token"}'
```
**结果：** 成功返回 access token、refresh token 和用户信息

#### ✅ Test 2: Get Current User
```bash
curl http://localhost:8793/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```
**结果：** 成功返回当前用户信息

#### ✅ Test 3: Access Protected Route (No Token)
```bash
curl http://localhost:8793/v1/humidors
```
**结果：** 正确返回 401 UNAUTHORIZED 错误

#### ✅ Test 4: Access Protected Route (With Token)
```bash
curl http://localhost:8793/v1/humidors \
  -H "Authorization: Bearer <access_token>"
```
**结果：** 成功访问受保护的路由

#### ✅ Test 5: Token Refresh
```bash
curl -X POST http://localhost:8793/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```
**结果：** 成功返回新的 token 对

#### ✅ Test 6: Logout
```bash
curl -X POST http://localhost:8793/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```
**结果：** 成功返回登出确认

#### ✅ Test 7: Invalid Token Handling
```bash
curl http://localhost:8793/v1/auth/me \
  -H "Authorization: Bearer invalid-token"
```
**结果：** 正确返回 401 UNAUTHORIZED 错误

## 📝 使用说明

### 开发环境配置

1. 创建 `.dev.vars` 文件（基于 `.dev.vars.example`）：
```bash
JWT_SECRET=your-secure-jwt-secret-here
APPLE_CLIENT_ID=com.cigaratlas.app
```

2. 启动开发服务器：
```bash
bun run dev
```

### 测试认证流程

使用提供的测试脚本：
```bash
./test-auth.sh
```

或者手动测试：

#### 1. 登录（开发模式）
```bash
curl -X POST http://localhost:8793/v1/auth/apple \
  -H "Content-Type: application/json" \
  -d '{"identityToken": "test-token"}'
```

保存返回的 `accessToken` 和 `refreshToken`。

#### 2. 访问受保护的路由
```bash
curl http://localhost:8793/v1/humidors \
  -H "Authorization: Bearer <accessToken>"
```

#### 3. 刷新 token
```bash
curl -X POST http://localhost:8793/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refreshToken>"}'
```

#### 4. 登出
```bash
curl -X POST http://localhost:8793/v1/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

### 生产环境配置

1. 在 Cloudflare Dashboard 中配置环境变量：
   - `JWT_SECRET` - 使用强随机字符串（至少 32 字符）
   - `APPLE_CLIENT_ID` - 你的 Apple App Bundle ID
   - `ENVIRONMENT` - 设置为 `production`

2. 配置 Apple Sign In：
   - 在 Apple Developer 门户创建 Sign In with Apple 配置
   - 配置 Service ID 和密钥
   - 在生产环境中，需要实现完整的 Apple token 验证（与服务端通信）

### 客户端集成示例

#### JavaScript/TypeScript
```typescript
// 登录
const loginResponse = await fetch('/v1/auth/apple', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identityToken: appleIdentityToken }),
});
const { accessToken, refreshToken } = await loginResponse.json();

// 存储 tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 访问受保护的 API
const response = await fetch('/v1/humidors', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
});

// Token 过期时刷新
const refreshResponse = await fetch('/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
});
const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshResponse.json();
```

## 🔒 安全注意事项

1. **JWT Secret**：在生产环境中使用强随机字符串，并定期轮换
2. **Token 存储**：客户端应安全存储 tokens（推荐使用 httpOnly cookies）
3. **HTTPS**：生产环境必须使用 HTTPS
4. **Token 黑名单**：未来可实现 token 黑名单以支持立即登出
5. **Apple Token 验证**：生产环境应实现完整的 Apple token 验证（与 Apple 服务器通信）

## 📦 依赖

- `@tsndr/cloudflare-worker-jwt` - JWT 库（已安装）
- `hono` - Web 框架（已安装）

## 📁 文件清单

- `src/utils/jwt.ts` - JWT 工具函数
- `src/middleware/auth.ts` - 认证中间件
- `src/routes/auth.ts` - 认证路由
- `src/routes/users.ts` - 用户路由（已更新，添加认证保护）
- `test-auth.sh` - 认证测试脚本
- `.dev.vars` - 开发环境变量（需要创建）

---

**实现日期：** 2026-03-18  
**实现者：** CigarAtlas Team
