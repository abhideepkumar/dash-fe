import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/schema', label: 'Schema Explorer', icon: 'database' },
    { path: '/history', label: 'Query History', icon: 'history' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  const { user } = useAuth();

  const NavigationContent = ({ isMobile = false }) => {
    const userDisplayName = user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'User';
    
    return (
    <>
      <nav className={`space-y-2 flex-1 custom-scrollbar overflow-y-auto px-1 ${isMobile ? 'pt-0' : 'pt-[80px]'}`}>
        {/* Collapse Toggle moved here for cleaner look */}
        {!isMobile && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-[90px] w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-md hover:text-primary hover:border-primary/20 transition-all focus:outline-none cursor-pointer z-[60] active:scale-90"
          >
            <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}>
              chevron_right
            </span>
          </button>
        )}
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={({isActive}) => `flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
              isActive 
                ? 'text-primary bg-primary/5 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            } ${(!isMobile && isCollapsed) ? 'justify-center px-0' : 'px-4'}`}
          >
            {({isActive}) => (
              <>
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  />
                )}
                
                <span className={`material-symbols-outlined text-[22px] shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'fill-1' : ''}`} 
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>

                {(!isMobile && isCollapsed) ? (
                   <div className="absolute left-[4.5rem] px-3 py-1.5 bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all -translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 text-[10px] font-bold tracking-wider uppercase shadow-xl">
                    {item.label}
                  </div>
                ) : (
                  <span className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
        <NavLink 
          to="/connect" 
          className={`flex items-center gap-3 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] ${(!isMobile && isCollapsed) ? 'justify-center px-0 mx-2' : 'px-6 mx-1'}`}
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          {(!isMobile && isCollapsed) ? null : <span>New Connection</span>}
        </NavLink>

        {(!isMobile && isCollapsed) ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-primary/10 flex items-center justify-center">
              {/* <img alt="User" src={user?.avatarUrl || "https://..."} className="w-full h-full object-cover" /> */}
              <span className="text-xs font-bold text-primary">{userDisplayName.charAt(0)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm mx-1">
            <div className="w-10 h-10 rounded-full border-2 border-slate-50 shadow-sm overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
               {/* <img alt="User" src={user?.avatarUrl || "https://..."} className="w-full h-full object-cover" /> */}
               <span className="text-xs font-bold text-primary">{userDisplayName.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{userDisplayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@dashboard.ai'}</p>
            </div>
          </div>
        )}
      </div>
    </>
    );
  };

  return (
    <div className="bg-[#F8FAFC] text-on-surface antialiased overflow-hidden min-h-screen flex flex-col">
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-6 lg:px-12 py-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          
          <span className="text-sm lg:text-base font-black text-slate-900 font-headline tracking-tight">Conversational Canvas</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex gap-6 items-center text-xs font-bold uppercase tracking-widest">
            <NavLink to="/schema" className={({isActive}) => isActive ? "text-primary border-b-2 border-primary pb-1" : "text-slate-400 hover:text-slate-600 transition-colors"}>Explorer</NavLink>
            <NavLink to="/" className={({isActive}) => isActive ? "text-primary border-b-2 border-primary pb-1" : "text-slate-400 hover:text-slate-600 transition-colors"}>Query Editor</NavLink>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden h-screen text-slate-900">
        
        {/* Mobile Backdrop Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md"
            />
          )}
        </AnimatePresence>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[280px] z-[70] bg-white shadow-2xl flex flex-col p-6"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              <NavigationContent isMobile={true} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop SideNavBar */}
        <motion.aside 
          animate={{ width: isCollapsed ? 100 : 288 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`hidden lg:flex flex-col pb-8 px-4 border-r border-slate-200 bg-white z-40 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
        >
          <NavigationContent isMobile={false} />
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col pt-[65px] overflow-hidden relative scale-100">
           <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
             <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
