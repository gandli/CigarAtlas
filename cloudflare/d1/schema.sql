-- CigarAtlas D1 Database Schema
-- Version: 1.0.0
-- Created: 2026-03-04

-- ============================================================================
-- User table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    apple_id TEXT UNIQUE NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'Asia/Shanghai',
    preferences TEXT, -- JSON string for user preferences
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================================================
-- Humidor table (雪茄柜)
-- ============================================================================
CREATE TABLE IF NOT EXISTS humidors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'cabinet' CHECK(type IN ('cabinet', 'cooler', 'desktop', 'travel')),
    description TEXT,
    target_temperature_min REAL DEFAULT 16.0, -- 目标温度下限 (°C)
    target_temperature_max REAL DEFAULT 18.0, -- 目标温度上限 (°C)
    target_humidity_min REAL DEFAULT 65.0,    -- 目标湿度下限 (%)
    target_humidity_max REAL DEFAULT 70.0,    -- 目标湿度上限 (%)
    image_url TEXT,
    capacity INTEGER,                          -- 容量（支）
    is_default INTEGER DEFAULT 0,              -- 是否为默认雪茄柜
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_humidors_user_id ON humidors(user_id);
CREATE INDEX IF NOT EXISTS idx_humidors_created_at ON humidors(created_at);

-- ============================================================================
-- Cigar table (雪茄记录)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cigars (
    id TEXT PRIMARY KEY,
    humidor_id TEXT NOT NULL,
    brand TEXT NOT NULL,              -- 品牌
    line TEXT,                        -- 系列/型号
    size TEXT,                        -- 尺寸 (e.g., "Robusto", "Toro", "Corona")
    vitola TEXT,                      -- 具体尺寸规格
    country TEXT,                     -- 产地
    wrapper TEXT,                     -- 茄衣
    binder TEXT,                      -- 茄套
    filler TEXT,                      -- 茄芯
    strength TEXT CHECK(strength IN ('mild', 'medium', 'full')), -- 浓度
    quantity INTEGER NOT NULL DEFAULT 1,
    purchase_date TEXT,
    purchase_price REAL,
    purchase_location TEXT,
    image_url TEXT,
    flavor_notes TEXT,                -- 风味笔记 (JSON array)
    personal_notes TEXT,               -- 个人笔记
    rating INTEGER CHECK(rating >= 1 AND rating <= 5), -- 评分 1-5
    smoking_status TEXT DEFAULT 'unsmoked' CHECK(smoking_status IN ('unsmoked', 'partial', 'finished')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (humidor_id) REFERENCES humidors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cigars_humidor_id ON cigars(humidor_id);
CREATE INDEX IF NOT EXISTS idx_cigars_brand ON cigars(brand);
CREATE INDEX IF NOT EXISTS idx_cigars_created_at ON cigars(created_at);
CREATE INDEX IF NOT EXISTS idx_cigars_purchase_date ON cigars(purchase_date);

-- ============================================================================
-- EnvironmentLog table (环境日志 - 温湿度记录)
-- ============================================================================
CREATE TABLE IF NOT EXISTS environment_logs (
    id TEXT PRIMARY KEY,
    humidor_id TEXT NOT NULL,
    temperature REAL NOT NULL,         -- 温度 (°C)
    humidity REAL NOT NULL,             -- 湿度 (%)
    logged_at TEXT NOT NULL,           -- 记录时间
    source TEXT DEFAULT 'manual' CHECK(source IN ('manual', 'sensor', 'iot')),
    device_id TEXT,                    -- IoT 设备 ID (如果有)
    note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (humidor_id) REFERENCES humidors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_logs_humidor_id ON environment_logs(humidor_id);
CREATE INDEX IF NOT EXISTS idx_logs_logged_at ON environment_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON environment_logs(created_at);

-- ============================================================================
-- Reminder table (养护提醒)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    humidor_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('check', 'smoke', 'rotate', 'hydrate')),
    title TEXT,                        -- 提醒标题
    interval_days INTEGER NOT NULL,    -- 间隔天数
    next_at TEXT NOT NULL,             -- 下次提醒时间
    last_notified_at TEXT,             -- 上次通知时间
    enabled INTEGER DEFAULT 1,
    notification_time TEXT DEFAULT '09:00', -- 每天通知时间
    note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (humidor_id) REFERENCES humidors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reminders_humidor_id ON reminders(humidor_id);
CREATE INDEX IF NOT EXISTS idx_reminders_next_at ON reminders(next_at);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(type);
CREATE INDEX IF NOT EXISTS idx_reminders_enabled ON reminders(enabled);

-- ============================================================================
-- SmokingSession table (品吸记录 - 未来扩展)
-- ============================================================================
CREATE TABLE IF NOT EXISTS smoking_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    cigar_id TEXT NOT NULL,
    smoked_at TEXT NOT NULL,
    duration_minutes INTEGER,
    pairing TEXT,                      -- 搭配饮品/食物
    location TEXT,
    weather TEXT,                      -- 天气
    mood TEXT,                         -- 心情
    draw_rating INTEGER CHECK(draw_rating >= 1 AND draw_rating <= 5),
    burn_rating INTEGER CHECK(burn_rating >= 1 AND burn_rating <= 5),
    ash_rating INTEGER CHECK(ash_rating >= 1 AND ash_rating <= 5),
    flavor_rating INTEGER CHECK(flavor_rating >= 1 AND flavor_rating <= 5),
    overall_rating INTEGER CHECK(overall_rating >= 1 AND overall_rating <= 5),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cigar_id) REFERENCES cigars(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON smoking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_cigar_id ON smoking_sessions(cigar_id);
CREATE INDEX IF NOT EXISTS idx_sessions_smoked_at ON smoking_sessions(smoked_at);

-- ============================================================================
-- UserNotification table (通知记录)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data TEXT,                         -- JSON payload
    read_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON user_notifications(read_at);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_humidors_timestamp 
AFTER UPDATE ON humidors
BEGIN
    UPDATE humidors SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_cigars_timestamp 
AFTER UPDATE ON cigars
BEGIN
    UPDATE cigars SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_reminders_timestamp 
AFTER UPDATE ON reminders
BEGIN
    UPDATE reminders SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_smoking_sessions_timestamp 
AFTER UPDATE ON smoking_sessions
BEGIN
    UPDATE smoking_sessions SET updated_at = datetime('now') WHERE id = NEW.id;
END;