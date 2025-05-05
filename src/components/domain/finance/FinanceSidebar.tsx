// FILE: src/components/finance/FinanceSidebar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChartBarIcon, 
  BanknotesIcon,
  BuildingLibraryIcon,
  CalculatorIcon,
  ArrowPathIcon,
  CreditCardIcon,
  CogIcon
} from "@heroicons/react/24/outline";

const financeNavItems = [
  {
    title: "Overview",
    href: "/dashboard/finance/overview",
    icon: <ChartBarIcon className="w-5 h-5" />,
  },
  {
    title: "Investments",
    href: "/dashboard/finance/investment",
    icon: <BuildingLibraryIcon className="w-5 h-5" />,
  },
  {
    title: "Retirement",
    href: "/dashboard/finance/retirement",
    icon: <BanknotesIcon className="w-5 h-5" />,
  },
  {
    title: "Tax Planning",
    href: "/dashboard/finance/tax",
    icon: <CalculatorIcon className="w-5 h-5" />,
  },
  {
    title: "Transactions",
    href: "/dashboard/finance/transactions",
    icon: <ArrowPathIcon className="w-5 h-5" />,
  },
];

export function FinanceSidebar() {
  const pathname = usePathname();

  // Determine if a nav link is active
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <div className="w-64 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Finance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your financial life</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {financeNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
            }`}
          >
            <span className={isActive(item.href) ? "text-blue-600 dark:text-blue-400" : ""}>
              {item.icon}
            </span>
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
      
      {/* Connection and Settings section at the bottom */}
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link 
          href="/dashboard/finance/connections"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            isActive("/dashboard/finance/connections")
              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
          }`}
        >
          <span className={isActive("/dashboard/finance/connections") ? "text-blue-600 dark:text-blue-400" : ""}>
            <CreditCardIcon className="w-5 h-5" />
          </span>
          <span>Connect Accounts</span>
        </Link>
        
        <Link 
          href="/dashboard/finance/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            isActive("/dashboard/finance/settings")
              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
          }`}
        >
          <span className={isActive("/dashboard/finance/settings") ? "text-blue-600 dark:text-blue-400" : ""}>
            <CogIcon className="w-5 h-5" />
          </span>
          <span>Settings</span>
        </Link>
      </div>
      
      {/* Account summary section */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Connected Accounts</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">5 accounts</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">$124,350.28</span>
        </div>
      </div>
    </div>
  );
}