"use client";

import { useState } from "react";

// Mock data for demonstration
const mockHumidors = [
  {
    id: "1",
    name: "主雪茄柜",
    capacity: 100,
    current: 45,
    temperature: 18.5,
    humidity: 68,
    lastChecked: "2小时前",
  },
  {
    id: "2",
    name: "新茄养护柜",
    capacity: 50,
    current: 12,
    temperature: 17.8,
    humidity: 65,
    lastChecked: "5小时前",
  },
];

const mockCigars = [
  {
    id: "1",
    brand: "Cohiba",
    line: "Siglo VI",
    size: "52 x 150mm",
    quantity: 5,
    purchaseDate: "2026-01-15",
    agingDays: 54,
    image: "🇨🇺",
  },
  {
    id: "2",
    brand: "Montecristo",
    line: "No. 2",
    size: "52 x 156mm",
    quantity: 10,
    purchaseDate: "2026-02-01",
    agingDays: 37,
    image: "🇨🇺",
  },
  {
    id: "3",
    brand: "Arturo Fuente",
    line: "Opus X",
    size: "49 x 152mm",
    quantity: 3,
    purchaseDate: "2025-12-20",
    agingDays: 80,
    image: "🇩🇴",
  },
];

export default function HumidorPage() {
  const [selectedHumidor, setSelectedHumidor] = useState(mockHumidors[0]);
  const [showAddCigar, setShowAddCigar] = useState(false);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            雪茄柜
          </h1>
          <button
            onClick={() => setShowAddCigar(!showAddCigar)}
            className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Humidor Selector */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide">
            {mockHumidors.map((humidor) => (
              <button
                key={humidor.id}
                onClick={() => setSelectedHumidor(humidor)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedHumidor.id === humidor.id
                    ? "bg-amber-500 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                {humidor.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Environment Stats */}
      <section className="px-4 py-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">
              环境监测
            </h2>
            <span className="text-xs text-stone-500">{selectedHumidor.lastChecked}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Temperature */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m.386-6.364 1.591 1.591M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                </svg>
                <span className="text-sm text-blue-600 dark:text-blue-400">温度</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {selectedHumidor.temperature}°C
              </div>
              <div className="text-xs text-blue-500 mt-1">理想: 16-18°C</div>
            </div>

            {/* Humidity */}
            <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m.386-6.364 1.591 1.591M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                </svg>
                <span className="text-sm text-teal-600 dark:text-teal-400">湿度</span>
              </div>
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                {selectedHumidor.humidity}%
              </div>
              <div className="text-xs text-teal-500 mt-1">理想: 65-70%</div>
            </div>
          </div>

          {/* Capacity */}
          <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-600 dark:text-stone-400">库存容量</span>
              <span className="text-stone-900 dark:text-stone-100 font-medium">
                {selectedHumidor.current} / {selectedHumidor.capacity}
              </span>
            </div>
            <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${(selectedHumidor.current / selectedHumidor.capacity) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Add Cigar Form */}
      {showAddCigar && (
        <section className="px-4 py-4">
          <form className="card space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddCigar(false); }}>
            <h2 className="font-semibold text-lg">添加雪茄</h2>
            
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">尺寸</label>
                <input
                  type="text"
                  placeholder="52 x 150mm"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">数量</label>
                <input
                  type="number"
                  placeholder="1"
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-stone-600 dark:text-stone-400 mb-1 block">购买日期</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddCigar(false)}
                className="btn btn-secondary flex-1"
              >
                取消
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                添加
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Cigars List */}
      <section className="px-4 pb-8">
        <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
          雪茄库存 ({mockCigars.length})
        </h2>
        <div className="space-y-3">
          {mockCigars.map((cigar) => (
            <article key={cigar.id} className="card flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center text-2xl flex-shrink-0">
                {cigar.image}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  {cigar.brand} · {cigar.line}
                </h3>
                <p className="text-sm text-stone-500">{cigar.size}</p>
                <div className="flex gap-3 mt-1 text-xs text-stone-400">
                  <span>×{cigar.quantity}</span>
                  <span>养护 {cigar.agingDays} 天</span>
                </div>
              </div>
              <button className="p-2 rounded-lg text-stone-400 hover:text-amber-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}