/**
 * 存储工具类
 */
import preferences from '@ohos.data.preferences';

const PREFERENCES_NAME = 'cigaratlas_prefs';

/**
 * 获取 Preferences 实例
 */
async function getPreferences(context: Context): Promise<preferences.Preferences> {
  return await preferences.getPreferences(context, PREFERENCES_NAME);
}

/**
 * 保存数据
 */
export async function saveData(context: Context, key: string, value: string | number | boolean): Promise<void> {
  const prefs = await getPreferences(context);
  await prefs.put(key, value);
  await prefs.flush();
}

/**
 * 获取数据
 */
export async function getData(context: Context, key: string, defaultValue: string | number | boolean): Promise<string | number | boolean> {
  const prefs = await getPreferences(context);
  return await prefs.get(key, defaultValue);
}

/**
 * 删除数据
 */
export async function removeData(context: Context, key: string): Promise<void> {
  const prefs = await getPreferences(context);
  await prefs.delete(key);
  await prefs.flush();
}

/**
 * 清空所有数据
 */
export async function clearAll(context: Context): Promise<void> {
  const prefs = await getPreferences(context);
  await prefs.clear();
  await prefs.flush();
}

/**
 * 检查是否存在某个键
 */
export async function hasKey(context: Context, key: string): Promise<boolean> {
  const prefs = await getPreferences(context);
  return prefs.has(key);
}