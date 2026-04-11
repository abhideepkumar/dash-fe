import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-emerald-950/60 backdrop-blur-2xl flex justify-between items-center px-12 py-4 ghost-border border-b border-white/40">
        <div className="flex items-center gap-8">
          <span className="text-lg font-black text-emerald-900 dark:text-emerald-50 font-headline tracking-tight">Conversational Canvas</span>
          <div className="hidden md:flex items-center bg-white/50 px-4 py-2 rounded-full border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,1)]">
            <span className="material-symbols-outlined text-outline text-sm mr-2">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-outline" placeholder="Search workspace..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex gap-6 items-center text-sm font-medium">
            <NavLink to="/schema" className={({isActive}) => isActive ? "text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-600 pb-1" : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-opacity"}>Explorer</NavLink>
            <NavLink to="/" className={({isActive}) => isActive ? "text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-600 pb-1" : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-opacity"}>Query Editor</NavLink>
            <a className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-opacity" href="#">Logs</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-full font-medium text-sm transition-transform active:scale-95 shadow-sm shadow-primary/20 hover:shadow-primary/40">Connect</button>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">notifications</span>
            <div className="h-10 w-10 rounded-full bg-secondary-container overflow-hidden border-2 border-white/60 shadow-sm">
              <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtHA6Yd2lteo0dw4NmPnBr4-DERFOwaYt1WM9V1zJgVp2MaWiiQN80kmvJ6sgV53ZqA0WggE_KwDLWzC9IXgW__eVUcqt577V-Rp516mYynbvYku0mUFQUqmF9NRBoq_llLvGzs3FyFDYd4x1mApnjC2hjIrCCAAlCFQwrwOG9xMESARbM_qaqF4dYa77LouNFFd0zc9cuimi7HGapilWdQZdsmc6TnOb2NxD2WtkYau4TccpFYOmnJ7rT4_8ehZAl7Z8RijLEd9Yr" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen pt-20">
        {/* SideNavBar */}
        <aside className={`fixed left-0 top-0 mt-20 h-[calc(100vh-80px)] rounded-r-[2.5rem] border-r border-white/60 bg-white/40 dark:bg-emerald-950/40 backdrop-blur-2xl flex flex-col py-8 z-40 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isCollapsed ? 'w-24 px-3' : 'w-72 px-6'}`}>
          
          <div className={`mb-10 px-2 lg:mb-12 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} relative`}>
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]">
              <span className="material-symbols-outlined text-on-primary-container text-sm">database</span>
            </div>
            
            {!isCollapsed && (
              <div className="whitespace-nowrap overflow-hidden leading-none">
                <h3 className="font-headline font-bold text-emerald-900 dark:text-emerald-50 mb-1">SQL Workspace</h3>
                <p className="text-[10px] tracking-widest uppercase text-outline font-bold">AI-Powered Editor</p>
              </div>
            )}

            {/* Collapse Toggle */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-[21px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md border border-white/60 flex items-center justify-center text-outline shadow-sm hover:text-primary transition-colors focus:outline-none z-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          </div>

          <nav className="space-y-3 flex-1 px-1">
            <NavLink to="/" className={({isActive}) => `flex items-center gap-4 py-3 rounded-2xl transition-colors group relative ${isActive ? 'text-emerald-700 dark:text-emerald-300 font-semibold border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] bg-white/40' : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 border border-transparent'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
              <span className="material-symbols-outlined text-lg shrink-0">dashboard</span>
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Dashboard</span>}
              {isCollapsed && <div className="absolute left-[4.5rem] px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 text-xs font-semibold shadow-sm border border-white/50 text-emerald-900">Dashboard</div>}
            </NavLink>
            
            <NavLink to="/schema" className={({isActive}) => `flex items-center gap-4 py-3 rounded-2xl transition-colors group relative ${isActive ? 'text-emerald-700 dark:text-emerald-300 font-semibold border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] bg-white/40' : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 border border-transparent'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
              <span className="material-symbols-outlined text-lg shrink-0">database</span>
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Schema Explorer</span>}
              {isCollapsed && <div className="absolute left-[4.5rem] px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 text-xs font-semibold shadow-sm border border-white/50 text-emerald-900">Schema Explorer</div>}
            </NavLink>

            <NavLink to="/saved" className={({isActive}) => `flex items-center gap-4 py-3 rounded-2xl transition-colors group relative ${isActive ? 'text-emerald-700 dark:text-emerald-300 font-semibold border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] bg-white/40' : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 border border-transparent'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
              <span className="material-symbols-outlined text-lg shrink-0">star</span>
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Saved Views</span>}
              {isCollapsed && <div className="absolute left-[4.5rem] px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 text-xs font-semibold shadow-sm border border-white/50 text-emerald-900">Saved Views</div>}
            </NavLink>

            <NavLink to="/history" className={({isActive}) => `flex items-center gap-4 py-3 rounded-2xl transition-colors group relative ${isActive ? 'text-emerald-700 dark:text-emerald-300 font-semibold border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] bg-white/40' : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 border border-transparent'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
              <span className="material-symbols-outlined text-lg shrink-0">history</span>
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Query History</span>}
              {isCollapsed && <div className="absolute left-[4.5rem] px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 text-xs font-semibold shadow-sm border border-white/50 text-emerald-900">Query History</div>}
            </NavLink>
            
            <NavLink to="/settings" className={({isActive}) => `flex items-center gap-4 py-3 rounded-2xl transition-colors group relative ${isActive ? 'text-emerald-700 dark:text-emerald-300 font-semibold border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] bg-white/40' : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 border border-transparent'} ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
              <span className="material-symbols-outlined text-lg shrink-0">settings</span>
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Settings</span>}
               {isCollapsed && <div className="absolute left-[4.5rem] px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 text-xs font-semibold shadow-sm border border-white/50 text-emerald-900">Settings</div>}
            </NavLink>
          </nav>

          <div className="mt-auto pt-6 px-1 border-t border-white/30">
             <NavLink to="/connect" className={`w-full flex items-center justify-center gap-2 bg-white/50 text-emerald-700 py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-colors mb-4 border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] ${isCollapsed ? 'px-0' : 'px-4'}`}>
                <span className="material-symbols-outlined text-sm">add</span>
                {!isCollapsed && <span>New Connection</span>}
            </NavLink>
            <a className={`flex items-center gap-4 py-3 rounded-2xl transition-colors text-slate-500 hover:bg-white/40 border border-transparent ${isCollapsed ? 'justify-center px-0' : 'px-4'}`} href="#">
              <span className="material-symbols-outlined shrink-0">account_circle</span>
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Profile</span>}
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 flex overflow-hidden h-[calc(100vh-80px)] relative transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isCollapsed ? 'ml-24' : 'ml-72'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
