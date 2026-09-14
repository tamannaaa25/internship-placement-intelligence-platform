"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token && !pathname.includes("/login") && !pathname.includes("/register") && !pathname.includes("/intelligence")) {
      router.push("/login");
    } else if (storedUser) {
      setTimeout(() => {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
        }
      }, 0);
    }
  }, [pathname, router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0e17]"></div>;
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0a0e17]">{children}</div>;
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: "📊", exact: true },
    { href: "/intelligence", label: "Placement Intelligence", icon: "🎓", exact: false },
    { href: "/applications", label: "Application Tracker", icon: "💼", exact: false },
    { href: "/analyzer", label: "Skill Analyzer", icon: "🧠", exact: false },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0e17] text-slate-100 font-sans">
      <aside className="w-64 bg-[#0c121e] border-r border-slate-800/80 flex flex-col justify-between p-5 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2 pt-1">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              PI
            </div>
            <div>
              <div className="font-semibold text-slate-100 text-sm leading-tight">Placement Intel</div>
              <div className="text-[11px] text-slate-500">Student & Campus Portal</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800/80 pt-4 px-2">
          {user ? (
            <div>
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left flex items-center gap-2 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                Sign Out &rarr;
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors block"
            >
              Sign In to Account &rarr;
            </Link>
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
