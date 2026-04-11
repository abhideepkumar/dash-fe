import { ReactNode } from "react";
import { Search, Database, LayoutDashboard, Star, History, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Schema Explorer", path: "/schema", icon: Database },
    { name: "Saved Queries", path: "/saved", icon: Star },
    { name: "Query History", path: "/history", icon: History },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-hidden min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md flex justify-between items-center px-12 py-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-8">
          <span className="text-lg font-black text-primary font-headline tracking-tight">Conversational Canvas</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/schema" className="text-outline hover:text-primary transition-opacity">Explorer</Link>
            <Link to="/" className="text-primary border-b-2 border-primary pb-1">Query Editor</Link>
            <Link to="/logs" className="text-outline hover:text-primary transition-opacity">Logs</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search workspace..." 
              className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border-2 border-white/10 text-on-secondary-container">
               <User className="w-5 h-5" />
            </div>
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-full font-medium text-sm transition-transform active:scale-95 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30">
              Connect
            </button>
          </div>
        </div>
      </nav>

      <div className="flex h-screen pt-[73px]">
        {/* SideNavBar */}
        <aside className="w-72 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-r border-outline-variant/20 flex flex-col h-full py-8 px-6 shadow-[0_40px_60px_rgba(0,0,0,0.04)] dark:shadow-none z-40">
          <div className="mb-10 px-2">
            <p className="tracking-widest uppercase text-[11px] font-label text-outline mb-2">Workspace</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center">
                <Database className="text-primary w-4 h-4" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface leading-none">SQL Workspace</h3>
                <p className="text-[10px] text-outline mt-1 font-label">AI-Powered Editor</p>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                    isActive 
                      ? "text-primary bg-primary/5 border-r-4 border-primary shadow-sm" 
                      : "text-outline hover:text-primary hover:bg-surface-container-low"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto pt-6 border-t border-outline-variant/10">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-outline hover:bg-surface-container-low text-sm font-medium">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
