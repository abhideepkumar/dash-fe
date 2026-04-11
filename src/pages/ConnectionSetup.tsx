import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ConnectionSetupPage() {
  const navigate = useNavigate();
  const [dbConfig, setDbConfig] = useState({
    host: '',
    port: '5432',
    database: '',
    user: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate connection
    console.log("Connecting with", dbConfig);
    // On success navigate back to canvas/dashboard
    navigate('/');
  };

  return (
    <div className="font-body bg-background text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen overflow-hidden relative">
      {/* Ethereal Background Canvas */}
      <div className="fixed inset-0 z-0 glass-gradient-bg overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-fixed/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-fixed/30 blur-[100px]"></div>
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="flex flex-col items-center w-full max-w-[400px]">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center p-4 mb-6 rounded-xl bg-surface-container-lowest/50 ethereal-blur border border-outline-variant/20 shadow-sm">
              <span className="material-symbols-outlined text-primary text-3xl">database</span>
            </div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Connect Database</h1>
            <p className="text-on-surface-variant/70 text-sm">Configure your workspace connection to start querying.</p>
          </div>

          {/* Signature Component: The Glass Canvas */}
          <div className="w-full bg-surface-container-lowest/70 ethereal-blur rounded-xl border border-outline-variant/20 shadow-[0_40px_60px_rgba(0,0,0,0.04)] p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Host Field */}
              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant block ml-1">Host</label>
                <div className="soft-inlay px-0 py-2 transition-all duration-200 focus-within:soft-inlay-focus">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 outline-none" 
                    placeholder="e.g. localhost or db.example.com" 
                    type="text" 
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Port & Connection Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 space-y-1.5">
                  <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant block ml-1">Port</label>
                  <div className="soft-inlay px-0 py-2 transition-all duration-200 focus-within:soft-inlay-focus">
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 outline-none" 
                      placeholder="5432" 
                      type="text"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant block ml-1">Username</label>
                  <div className="soft-inlay px-0 py-2 transition-all duration-200 focus-within:soft-inlay-focus">
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 outline-none" 
                      placeholder="admin_user" 
                      type="text"
                      value={dbConfig.user}
                      onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Database Name (Added from old logic) */}
              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant block ml-1">Database Name</label>
                <div className="soft-inlay px-0 py-2 transition-all duration-200 focus-within:soft-inlay-focus flex items-center">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 outline-none" 
                    placeholder="postgres" 
                    type="text"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant block ml-1">Password</label>
                <div className="soft-inlay px-0 py-2 transition-all duration-200 focus-within:soft-inlay-focus flex items-center">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 outline-none flex-1" 
                    placeholder="••••••••••••" 
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                    required
                  />
                  <span className="material-symbols-outlined text-outline/60 text-lg cursor-pointer mr-2 hover:text-primary transition-colors">visibility</span>
                </div>
              </div>

              {/* Additional Details */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer group">
                  <span className="material-symbols-outlined text-primary text-base">settings_ethernet</span>
                  <span className="text-xs font-medium text-primary group-hover:underline">Advanced Options</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
                  <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant/60 font-bold">SSL Required</span>
                </div>
              </div>

              {/* CTA Section */}
              <div className="pt-4">
                <button 
                  className="w-full rounded-full py-4 px-8 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-sm tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 transform active:scale-[0.98] transition-all duration-150" 
                  type="submit"
                >
                  Connect Database
                </button>
              </div>
            </form>
          </div>

          {/* Footer Meta */}
          <div className="mt-8 flex items-center gap-8 text-on-surface-variant/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">encrypted</span>
              <span className="text-[11px] uppercase tracking-widest font-medium">End-to-end Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[11px] uppercase tracking-widest font-medium">Auto-Detection</span>
            </div>
          </div>

          {/* Back to Canvas Link */}
          <button onClick={() => navigate('/')} className="mt-12 text-sm font-medium text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Return to Workspace
          </button>
        </div>
      </main>

      {/* Decoration Layer: Floating shapes for depth */}
      <div className="fixed bottom-12 left-12 z-0 hidden lg:block opacity-20 rotate-12">
        <div className="w-32 h-32 border border-primary rounded-xl"></div>
      </div>
      <div className="fixed top-24 right-24 z-0 hidden lg:block opacity-10 -rotate-12">
        <div className="w-48 h-48 bg-primary-container rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default ConnectionSetupPage;
