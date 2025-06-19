'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserGroupIcon,
  HeartIcon,
  CalendarIcon,
  DocumentTextIcon,
  CameraIcon,
  CogIcon
} from "@heroicons/react/24/outline";

const familyNavItems = [
  {
    title: "Overview",
    href: "/dashboard/family",
    icon: <UserGroupIcon className="w-5 h-5" />,
  },
  {
    title: "Pets",
    href: "/dashboard/family/pets",
    icon: <HeartIcon className="w-5 h-5" />,
  },
  {
    title: "Events",
    href: "/dashboard/family/events",
    icon: <CalendarIcon className="w-5 h-5" />,
  },
  {
    title: "Documents",
    href: "/dashboard/family/documents",
    icon: <DocumentTextIcon className="w-5 h-5" />,
  },
  {
    title: "Photos",
    href: "/dashboard/family/photos",
    icon: <CameraIcon className="w-5 h-5" />,
  },
  {
    title: "Settings",
    href: "/dashboard/family/settings",
    icon: <CogIcon className="w-5 h-5" />,
  },
];

export function FamilySidebar() {
  const pathname = usePathname();

  return (
    <div className="w-56 bg-card border-r border-border/50">
      <div className="h-full py-6">
        <nav className="space-y-1 px-3">
          {familyNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}