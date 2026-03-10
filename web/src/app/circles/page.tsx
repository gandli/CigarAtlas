"use client";

import { useState } from "react";

// Mock data for demonstration
const mockCircles = [
  {
    id: "1",
    name: "古巴雪茄鉴赏会",
    description: "专注古巴雪茄品鉴与交流",
    members: 1256,
    posts: 892,
    avatar: "🇨🇺",
  },
  {
    id: "2",
    name: "新手入门指南",
    description: "零基础雪茄知识分享",
    members: 3421,
    posts: 1456,
    avatar: "📚",
  },
  {
    id: "3",
    name: "多米尼加探索",
    description: "探索多米尼加雪茄的魅力",
    members: 876,
    posts: 432,
    avatar: "🇩🇴",
  },
  {
    id: "4",
    name: "雪茄配饮交流",
    description: "威士忌、朗姆酒、咖啡搭配心得",
    members: 2105,
    posts: 768,
    avatar: "🥃",
  },
];

const mockPosts = [
  {
    id: "1",
    author: "雪茄老炮儿",
    avatar: "🧔",
    time: "2小时前",
    content: "今天收到一盒 Cohiba Siglo VI，迫不及待想试试。有朋友一起品鉴吗？坐标北京朝阳区。",
    likes: 45,
    comments: 12,
  },
  {
    id: "2",
    author: "新手小王",
    avatar: "👨",
    time: "5小时前",
    content: "请问各位大佬，新手入门推荐什么雪茄？预算300以内。",
    likes: 23,
    comments: 38,
  },
  {
    id: "3",
    author: "威士忌配茄",
    avatar: "🥃",
    time: "昨天",
    content: "发现一个绝配：Montecristo No.2 配 麦卡伦12年。浓郁的咖啡香和威士忌的果香完美融合，推荐大家试试！",
    likes: 89,
    comments: 24,
  },
];

export default function CirclesPage() {
  const [activeTab, setActiveTab] = useState<"circles" | "feed">("feed");

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            社交圈子
          </h1>
          {/* Tab Switcher */}
          <div className="flex bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("feed")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "feed"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              动态
            </button>
            <button
              onClick={() => setActiveTab("circles")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "circles"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-600 dark:text-stone-400"
              }`}
            >
              圈子
            </button>
          </div>
        </div>
      </header>

      {activeTab === "feed" ? (
        /* Feed Tab */
        <section className="px-4 py-4">
          {/* Create Post Button */}
          <button className="w-full card flex items-center gap-3 mb-4 text-left">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-lg">
              😊
            </div>
            <span className="text-stone-500">分享你的雪茄体验...</span>
          </button>

          {/* Posts */}
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <article key={post.id} className="card">
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-lg">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-stone-900 dark:text-stone-100">
                      {post.author}
                    </div>
                    <div className="text-xs text-stone-500">{post.time}</div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-stone-700 dark:text-stone-300 mb-3">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button className="flex items-center gap-1 text-stone-500 hover:text-amber-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-stone-500 hover:text-amber-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg>
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 text-stone-500 hover:text-amber-500 transition-colors ml-auto">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        /* Circles Tab */
        <section className="px-4 py-4">
          <div className="space-y-3">
            {mockCircles.map((circle) => (
              <article key={circle.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {circle.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {circle.name}
                  </h3>
                  <p className="text-sm text-stone-500 truncate">{circle.description}</p>
                  <div className="flex gap-3 mt-1 text-xs text-stone-400">
                    <span>{circle.members} 成员</span>
                    <span>{circle.posts} 帖子</span>
                  </div>
                </div>
                <button className="btn btn-primary text-sm px-4 py-2">
                  加入
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}