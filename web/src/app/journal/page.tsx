"use client";

import { useState } from "react";

// Mock data for demonstration
const mockEntries = [
  {
    id: "1",
    brand: "Cohiba",
    line: "Siglo VI",
    size: "52 x 150mm",
    date: "2026-03-08",
    score: 92,
    flavors: ["木质", "皮革", "坚果"],
    notes: "口感醇厚，燃烧均匀，尾段带有轻微的香料感。",
  },
  {
    id: "2",
    brand: "Montecristo",
    line: "No. 2",
    size: "52 x 156mm",
    date: "2026-03-05",
    score: 88,
    flavors: ["咖啡", "可可", "泥土"],
    notes: "经典之作，浓郁度适中，适合下午品鉴。",
  },
  {
    id: "3",
    brand: "Romeo y Julieta",
    line: "Churchill",
    size: "47 x 178mm",
    date: "2026-03-01",
    score: 85,
    flavors: ["奶油", "香草", "烤面包"],
    notes: "温和型雪茄，适合新手入门。",
  },
];

export default function JournalPage() {
  const [entries] = useState(mockEntries);
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            品鉴记录
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <section className="px-4 py-4">
        <div className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide">
          <div className="flex-shrink-0 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {entries.length}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300">品鉴次数</div>
          </div>
          <div className="flex-shrink-0 px-4 py-3 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <div className="text-2xl font-bold text-stone-700 dark:text-stone-300">
              {Math.round(entries.reduce((acc, e) => acc + e.score, 0) / entries.length)}
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400">平均评分</div>
          </div>
          <div className="flex-shrink-0 px-4 py-3 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <div className="text-2xl font-bold text-stone-700 dark:text-stone-300">
              {new Set(entries.map(e => e.brand)).size}
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400">尝试品牌</div>
          </div>
        </div>
      </section>

      {/* Add Entry Form (Expandable) */}
      {showForm && (
        <section className="px-4 py-4">
          <form className="card space-y-4" onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}>
            <h2 className="font-semibold text-lg">新建品鉴记录</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">品牌</label>
                <input
                  type="text"
                  placeholder="Cohiba"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">系列</label>
                <input
                  type="text"
                  placeholder="Siglo VI"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">尺寸</label>
              <input
                type="text"
                placeholder="52 x 150mm"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">评分 (1-100)</label>
              <input
                type="range"
                min="1"
                max="100"
                defaultValue="80"
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">风味标签</label>
              <div className="flex flex-wrap gap-2">
                {["木质", "皮革", "坚果", "咖啡", "可可", "奶油", "香料", "泥土"].map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    className="px-3 py-1 text-sm rounded-full border border-stone-200 dark:border-stone-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95 transition-all"
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">品鉴笔记</label>
              <textarea
                rows={3}
                placeholder="记录你的品鉴体验..."
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              保存记录
            </button>
          </form>
        </section>
      )}

      {/* Entries List */}
      <section className="px-4 pb-8">
        <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
          最近品鉴
        </h2>
        <div className="space-y-3">
          {entries.map((entry) => (
            <article key={entry.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    {entry.brand} · {entry.line}
                  </h3>
                  <p className="text-sm text-stone-500">{entry.size}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    {entry.score}
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">分</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {entry.flavors.map((flavor) => (
                  <span
                    key={flavor}
                    className="px-2 py-0.5 text-xs rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                {entry.notes}
              </p>
              
              <time className="text-xs text-stone-400">{entry.date}</time>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}