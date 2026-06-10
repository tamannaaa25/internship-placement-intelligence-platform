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
    setMounted(true);
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token && !pathname.includes("/login") && !pathname.includes("/register")) {
      router.push("/login");
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [pathname, router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

  if (!mounted) {
    return <div className="min-h-screen bg-[#030712]"></div>;
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#030712]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              IP
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Placement Intel
            </span>
          </div>

          <nav className="space-y-1">
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === "/"
                  ? "bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/applications"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith("/applications")
                  ? "bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              💼 Application Tracker
            </Link>
            <Link
              href="/analyzer"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith("/analyzer")
                  ? "bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              🧠 Skill Analyzer
            </Link>
          </nav>
        </div>

        {/* User profile / Log out */}
        {user && (
          <div className="border-t border-slate-800 pt-6">
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              🛑 Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
