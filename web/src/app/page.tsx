import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-lg mx-auto text-center">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-4xl">🥃</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-3">
            CigarAtlas
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
            雪茄爱好者的社区平台
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/journal"
              className="btn btn-primary"
            >
              开始品鉴
            </Link>
            <Link
              href="/circles"
              className="btn btn-secondary"
            >
              浏览社区
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-8 md:py-12">
        <div className="max-w-lg mx-auto space-y-4">
          <FeatureCard
            icon="📔"
            title="品鉴记录"
            description="记录每一次品鉴体验，追踪口味偏好变化"
            href="/journal"
          />
          <FeatureCard
            icon="👥"
            title="社交圈子"
            description="与同好交流，分享心得，发现志同道合的雪茄爱好者"
            href="/circles"
          />
          <FeatureCard
            icon="📍"
            title="本地聚会"
            description="发现附近的雪茄活动，参与线下品鉴会"
            href="/meetups"
          />
          <FeatureCard
            icon="🗄️"
            title="雪茄柜管理"
            description="管理库存，追踪温湿度，设置养护提醒"
            href="/humidor"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-8 md:py-12 bg-stone-100/50 dark:bg-stone-900/50">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-center mb-6 text-stone-900 dark:text-stone-100">
            平台数据
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard value="10,000+" label="品鉴记录" />
            <StatCard value="500+" label="活跃用户" />
            <StatCard value="50+" label="城市覆盖" />
            <StatCard value="200+" label="雪茄品牌" />
          </div>
        </div>
      </section>

      {/* Compliance Notice */}
      <section className="px-4 py-6 text-center">
        <p className="text-xs text-stone-500 dark:text-stone-500">
          ⚠️ 本平台仅供成年用户使用。吸烟有害健康，请理性消费。
        </p>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="card flex items-start gap-4 active:scale-[0.98] transition-transform">
      <span className="text-3xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
          {title}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">{description}</p>
      </div>
      <svg
        className="w-5 h-5 text-stone-400 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-amber-600 dark:text-amber-500 mb-1">
        {value}
      </div>
      <div className="text-sm text-stone-600 dark:text-stone-400">{label}</div>
    </div>
  );
}