"use client";

import { useState } from "react";

// Mock data for demonstration
const mockMeetups = [
  {
    id: "1",
    title: "北京雪茄品鉴会 · 春日雅集",
    date: "2026-03-15",
    time: "14:00 - 18:00",
    location: "北京市朝阳区三里屯",
    participants: 24,
    maxParticipants: 30,
    host: "雪茄俱乐部",
    tags: ["品鉴", "古巴", "威士忌配对"],
    image: "🏙️",
  },
  {
    id: "2",
    title: "上海 · 新手入门分享会",
    date: "2026-03-18",
    time: "15:00 - 17:00",
    location: "上海市静安区",
    participants: 18,
    maxParticipants: 20,
    host: "新手联盟",
    tags: ["入门", "教学", "问答"],
    image: "🌆",
  },
  {
    id: "3",
    title: "深圳 · 古巴雪茄专题品鉴",
    date: "2026-03-22",
    time: "19:00 - 22:00",
    location: "深圳市南山区",
    participants: 32,
    maxParticipants: 40,
    host: "南方茄友会",
    tags: ["古巴", "Cohiba", "Montecristo"],
    image: "🌃",
  },
  {
    id: "4",
    title: "成都 · 雪茄与威士忌之夜",
    date: "2026-03-25",
    time: "19:30 - 22:30",
    location: "成都市锦江区",
    participants: 15,
    maxParticipants: 25,
    host: "西部雪茄社",
    tags: ["威士忌", "品鉴", "配饮"],
    image: "🌃",
  },
];

const cities = ["全部", "北京", "上海", "深圳", "成都", "杭州", "广州"];

export default function MeetupsPage() {
  const [selectedCity, setSelectedCity] = useState("全部");

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            本地聚会
          </h1>
          
          {/* City Filter */}
          <div className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide pb-1">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCity === city
                    ? "bg-amber-500 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Meetups List */}
      <section className="px-4 py-4">
        <div className="space-y-4">
          {mockMeetups.map((meetup) => (
            <article key={meetup.id} className="card overflow-hidden">
              {/* Header */}
              <div className="flex gap-3 mb-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center text-3xl flex-shrink-0">
                  {meetup.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-2">
                    {meetup.title}
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">{meetup.host}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span>{meetup.date} · {meetup.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>{meetup.location}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {meetup.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-600 dark:to-stone-700 border-2 border-white dark:border-stone-900"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-stone-500 ml-1">
                    {meetup.participants}/{meetup.maxParticipants}
                  </span>
                </div>
                <button className="btn btn-primary text-sm px-4 py-2">
                  报名参加
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Create Meetup FAB */}
      <button className="fixed bottom-24 right-4 md:bottom-8 w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-95 transition-transform z-30">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </main>
  );
}