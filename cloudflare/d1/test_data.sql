-- CigarAtlas Test Data
-- For local development and testing

-- ============================================================================
-- Test Users
-- ============================================================================
INSERT INTO users (id, apple_id, nickname, timezone) VALUES 
    ('user-001', 'apple-user-001', '雪茄爱好者', 'Asia/Shanghai'),
    ('user-002', 'apple-user-002', '哈瓦那迷', 'America/New_York');

-- ============================================================================
-- Test Humidors
-- ============================================================================
INSERT INTO humidors (id, user_id, name, type, description, target_temperature_min, target_temperature_max, target_humidity_min, target_humidity_max, capacity, is_default) VALUES 
    ('humidor-001', 'user-001', '主雪茄柜', 'cabinet', '客厅的主要雪茄柜', 16.0, 18.0, 65.0, 70.0, 100, 1),
    ('humidor-002', 'user-001', '旅行保湿盒', 'travel', '便携式旅行保湿盒', 15.0, 20.0, 60.0, 75.0, 20, 0),
    ('humidor-003', 'user-002', '办公室雪茄柜', 'desktop', '办公室用的小型雪茄柜', 17.0, 18.5, 68.0, 72.0, 50, 1);

-- ============================================================================
-- Test Cigars
-- ============================================================================
INSERT INTO cigars (id, humidor_id, brand, line, size, vitola, country, wrapper, binder, filler, strength, quantity, purchase_date, purchase_price, purchase_location, flavor_notes, personal_notes, rating, smoking_status) VALUES 
    ('cigar-001', 'humidor-001', 'Cohiba', 'Siglo VI', 'Toro', '56x150mm', 'Cuba', 'Cuban Habano', 'Cuban Habano', 'Cuban Habano', 'medium', 5, '2025-12-15', 280.0, '上海', '["coffee", "leather", "cedar"]', '非常棒，适合特殊场合', 5, 'unsmoked'),
    ('cigar-002', 'humidor-001', 'Montecristo', 'No. 2', 'Torpedo', '61x156mm', 'Cuba', 'Cuban Habano', 'Cuban Habano', 'Cuban Habano', 'medium', 10, '2025-11-20', 180.0, '香港', '["chocolate", "nuts", "cream"]', '经典款式，日常首选', 4, 'unsmoked'),
    ('cigar-003', 'humidor-001', 'Arturo Fuente', 'Opus X', 'Robusto', '50x124mm', 'Dominican Republic', 'Dominican Habano', 'Dominican Habano', 'Dominican Habano', 'full', 3, '2026-01-05', 320.0, '美国', '["spice", "cedar", "dried fruit"]', '稀有款，值得收藏', 5, 'unsmoked'),
    ('cigar-004', 'humidor-002', 'Padrón', '1964 Anniversary', 'Toro', '54x140mm', 'Nicaragua', 'Nicaraguan Habano', 'Nicaraguan Habano', 'Nicaraguan Habano', 'full', 2, '2025-10-10', 250.0, '拉斯维加斯', '["espresso", "dark chocolate", "pepper"]', '旅行时享用', 4, 'partial'),
    ('cigar-005', 'humidor-003', 'Davidoff', 'Grand Cru', 'Corona', '43x142mm', 'Dominican Republic', 'Connecticut', 'Dominican', 'Dominican', 'mild', 8, '2026-02-01', 150.0, '苏黎世', '["cream", "nuts", "light spice"]', '办公室日常', 4, 'unsmoked');

-- ============================================================================
-- Test Environment Logs
-- ============================================================================
INSERT INTO environment_logs (id, humidor_id, temperature, humidity, logged_at, source, device_id, note) VALUES 
    ('log-001', 'humidor-001', 17.2, 68.5, datetime('now', '-1 hour'), 'sensor', 'sensor-001', '正常范围'),
    ('log-002', 'humidor-001', 17.5, 67.8, datetime('now', '-2 hours'), 'sensor', 'sensor-001', '正常范围'),
    ('log-003', 'humidor-001', 18.1, 69.2, datetime('now', '-3 hours'), 'sensor', 'sensor-001', '温度略高'),
    ('log-004', 'humidor-002', 18.5, 66.0, datetime('now', '-1 hour'), 'manual', NULL, '旅行中检查'),
    ('log-005', 'humidor-003', 17.8, 70.5, datetime('now', '-1 hour'), 'iot', 'iot-device-001', '办公室环境稳定');

-- ============================================================================
-- Test Reminders
-- ============================================================================
INSERT INTO reminders (id, humidor_id, type, title, interval_days, next_at, enabled, notification_time, note) VALUES 
    ('reminder-001', 'humidor-001', 'check', '每周检查', 7, datetime('now', '+7 days'), 1, '09:00', '检查温湿度和雪茄状态'),
    ('reminder-002', 'humidor-001', 'rotate', '每月轮换', 30, datetime('now', '+30 days'), 1, '10:00', '轮换雪茄位置确保均匀陈化'),
    ('reminder-003', 'humidor-001', 'hydrate', '补充保湿', 90, datetime('now', '+90 days'), 1, '09:00', '检查并补充保湿装置'),
    ('reminder-004', 'humidor-002', 'check', '旅行前检查', 14, datetime('now', '+14 days'), 1, '08:00', '旅行前确认保湿盒状态'),
    ('reminder-005', 'humidor-003', 'check', '办公室检查', 14, datetime('now', '+14 days'), 1, '17:00', '下班前检查');

-- ============================================================================
-- Test Smoking Sessions
-- ============================================================================
INSERT INTO smoking_sessions (id, user_id, cigar_id, smoked_at, duration_minutes, pairing, location, weather, mood, draw_rating, burn_rating, ash_rating, flavor_rating, overall_rating, notes) VALUES 
    ('session-001', 'user-001', 'cigar-004', datetime('now', '-5 days'), 75, '单一麦芽威士忌', '家中阳台', '晴朗，18°C', '放松', 5, 4, 5, 5, 5, '完美的夜晚，Opus X 的表现超出预期'),
    ('session-002', 'user-001', 'cigar-002', datetime('now', '-10 days'), 60, '浓缩咖啡', '办公室', '多云，22°C', '专注', 4, 4, 4, 4, 4, '工作间隙的享受，Montecristo 一如既往的稳定');

-- ============================================================================
-- Test User Notifications
-- ============================================================================
INSERT INTO user_notifications (id, user_id, type, title, body, data, read_at) VALUES 
    ('notif-001', 'user-001', 'reminder', '每周检查提醒', '该检查您的主雪茄柜了', '{"humidor_id": "humidor-001"}', NULL),
    ('notif-002', 'user-001', 'alert', '温度异常', '主雪茄柜温度超过设定范围', '{"humidor_id": "humidor-001", "temperature": 19.5}', datetime('now', '-1 day')),
    ('notif-003', 'user-002', 'reminder', '办公室检查提醒', '该检查您的办公室雪茄柜了', '{"humidor_id": "humidor-003"}', NULL);
