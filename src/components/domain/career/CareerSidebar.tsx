'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChartBarIcon, 
  BriefcaseIcon,
  UsersIcon,
  AcademicCapIcon,
  LightBulbIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

const careerNavItems = [
  {
    title: "Overview",
    href: "/dashboard/career/overview",
    icon: <ChartBarIcon className="w-5 h-5" />,
  },
  {
    title: "Opportunities",
    href: "/dashboard/career/opportunities",
    icon: <BriefcaseIcon className="w-5 h-5" />,
  },
  {
    title: "Networking",
    href: "/dashboard/career/networking",
    icon: <UsersIcon className="w-5 h-5" />,
  },
  {
    title: "Skills",
    href: "/dashboard/career/skills",
    icon: <AcademicCapIcon className="w-5 h-5" />,
  },
  {
    title: "Resume",
    href: "/dashboard/career/resume",
    icon: <DocumentTextIcon className="w-5 h-5" />,
  },
];

export function CareerSidebar() {
  const pathname = usePathname();

  // Determine if a nav link is active
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <div className="w-64 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Career</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your professional life</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {careerNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
            }`}
          >
            <span className={isActive(item.href) ? "text-purple-600 dark:text-purple-400" : ""}>
              {item.icon}
            </span>
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
      
      {/* Growth insights and Settings */}
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link 
          href="/dashboard/career/insights"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            isActive("/dashboard/career/insights")
              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
          }`}
        >
          <span className={isActive("/dashboard/career/insights") ? "text-purple-600 dark:text-purple-400" : ""}>
            <LightBulbIcon className="w-5 h-5" />
          </span>
          <span>Growth Insights</span>
        </Link>
        
        <Link 
          href="/dashboard/career/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            isActive("/dashboard/career/settings")
              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
          }`}
        >
          <span className={isActive("/dashboard/career/settings") ? "text-purple-600 dark:text-purple-400" : ""}>
            <Cog6ToothIcon className="w-5 h-5" />
          </span>
          <span>Settings</span>
        </Link>
      </div>
      
      {/* Career stats */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Strength</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">78% - Add more skills to improve</p>
      </div>
    </div>
  );
}