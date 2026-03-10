import Link from "next/link";

// SVG Icons (no emojis for professional UI)
const JournalIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const CirclesIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const MeetupsIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const HumidorIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen hero-gradient">
      {/* Hero Section */}
      <section className="px-4 pt-16 pb-10 md:pt-24 md:pb-16">
        <div className="max-w-lg mx-auto text-center">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary via-amber-600 to-amber-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/25 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
            CigarAtlas
          </h1>
          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 mb-10 font-light">
            雪茄爱好者的社区平台
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/journal" className="btn btn-primary cursor-pointer">
              开始品鉴
              <ArrowRightIcon />
            </Link>
            <Link href="/circles" className="btn btn-secondary cursor-pointer">
              浏览社区
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-10 md:py-16">
        <div className="max-w-lg mx-auto space-y-4">
          <FeatureCard
            icon={<JournalIcon />}
            title="品鉴记录"
            description="记录每一次品鉴体验，追踪口味偏好变化"
            href="/journal"
          />
          <FeatureCard
            icon={<CirclesIcon />}
            title="社交圈子"
            description="与同好交流，分享心得，发现志同道合的雪茄爱好者"
            href="/circles"
          />
          <FeatureCard
            icon={<MeetupsIcon />}
            title="本地聚会"
            description="发现附近的雪茄活动，参与线下品鉴会"
            href="/meetups"
          />
          <FeatureCard
            icon={<HumidorIcon />}
            title="雪茄柜管理"
            description="管理库存，追踪温湿度，设置养护提醒"
            href="/humidor"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-10 md:py-16">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-2xl font-semibold text-center mb-8 text-stone-900 dark:text-stone-100">
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
      <section className="px-4 py-8 text-center">
        <p className="text-sm text-stone-500 dark:text-stone-500">
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
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="card flex items-center gap-4 cursor-pointer feature-card group">
      <div className="icon-container icon-container-gold">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">{description}</p>
      </div>
      <div className="text-stone-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
        <ArrowRightIcon />
      </div>
    </Link>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card text-center stat-glow cursor-default">
      <div className="text-2xl font-bold animate-shimmer mb-1">
        {value}
      </div>
      <div className="text-sm text-stone-600 dark:text-stone-400">{label}</div>
    </div>
  );
}