

export function SchemaExplorerPage() {
  return (
    <div className="w-full h-full overflow-y-auto px-12 py-12">
      <header className="mb-16 flex justify-between items-end">
        <div className="max-w-2xl">
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-[11px] mb-4">Architecture / Data Sources</p>
          <h1 className="text-5xl font-bold tracking-tight text-on-surface font-headline mb-6">Schema Explorer</h1>
          <p className="text-slate-500 text-lg leading-relaxed font-body">
            Visualize and manage your relational structures. Our AI-driven engine has indexed 14 active tables across your production environment.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-on-primary px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Re-Sync Schema
          </button>
        </div>
      </header>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
        
        {/* Table Card: Users */}
        <div className="glass-canvas ghost-border rounded-xl p-8 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Row Count</p>
              <h4 className="text-2xl font-bold font-headline text-on-surface">1.2M</h4>
            </div>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-6 font-headline">users</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">id</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">uuid</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">email</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">varchar</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">created_at</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">timestamp</span>
            </div>
          </div>
          <button className="mt-8 text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            View Full Schema <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Table Card: Orders */}
        <div className="glass-canvas ghost-border rounded-xl p-8 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
              <span className="material-symbols-outlined text-secondary">shopping_bag</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Row Count</p>
              <h4 className="text-2xl font-bold font-headline text-on-surface">840K</h4>
            </div>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-6 font-headline">orders</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">id</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">bigint</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">user_id</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">f-key</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">total_amount</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">decimal</span>
            </div>
          </div>
          <button className="mt-8 text-secondary text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            View Full Schema <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Table Card: Products */}
        <div className="glass-canvas ghost-border rounded-xl p-8 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/5 flex items-center justify-center group-hover:bg-tertiary/10 transition-colors">
              <span className="material-symbols-outlined text-tertiary">inventory_2</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Row Count</p>
              <h4 className="text-2xl font-bold font-headline text-on-surface">12.5K</h4>
            </div>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-6 font-headline">products</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">sku</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">varchar</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">metadata</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">jsonb</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">price_cents</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">integer</span>
            </div>
          </div>
          <button className="mt-8 text-tertiary text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            View Full Schema <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Table Card: Subscriptions */}
        <div className="glass-canvas ghost-border rounded-xl p-8 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">card_membership</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Row Count</p>
              <h4 className="text-2xl font-bold font-headline text-on-surface">150K</h4>
            </div>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-6 font-headline">subscriptions</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">id</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">uuid</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">status</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">enum</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">renewal_date</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">date</span>
            </div>
          </div>
        </div>

        {/* Table Card: Logs */}
        <div className="glass-canvas ghost-border rounded-xl p-8 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-outline/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-outline">list_alt</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Row Count</p>
              <h4 className="text-2xl font-bold font-headline text-on-surface">15.2M</h4>
            </div>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-6 font-headline">audit_logs</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">event_id</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">uuid</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">action</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">varchar</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-outline-variant/10">
              <span className="font-mono text-slate-500">timestamp</span>
              <span className="bg-surface-container text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">timestamptz</span>
            </div>
          </div>
          <button className="mt-8 text-outline text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            View Full Schema <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Bento Health Card */}
        <div className="xl:col-span-1 glass-canvas ghost-border rounded-xl p-8 bg-gradient-to-br from-white/80 to-emerald-50/30 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">Workspace Health</h3>
            <p className="text-slate-500 text-sm mb-6">Real-time indexing status & storage.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">Storage Used</span>
                    <span className="text-xs text-slate-500">72%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[72%]"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">Index Latency</span>
                    <span className="text-xs text-slate-500">12ms</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[15%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">verified</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">Schema Synchronized</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400">v2.4.1-alpha</span>
          </div>
        </div>
      </div>

      {/* Storage & Health Summary Footer Section */}
      <section className="mt-24 pt-12 border-t border-emerald-500/10">
        <div className="flex flex-col md:flex-row gap-12 items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-headline mb-4">Infrastructure Integrity</h2>
            <p className="text-slate-500 text-base max-w-lg mb-8 font-body">
              Your database instances are distributed across three primary regions to ensure maximum availability and low-latency query performance.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 bg-surface-container-low rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Region</span>
                <span className="font-semibold text-emerald-800">us-east-1</span>
              </div>
              <div className="p-4 bg-surface-container-low rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Uptime</span>
                <span className="font-semibold text-emerald-800">99.99%</span>
              </div>
              <div className="p-4 bg-surface-container-low rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Replica</span>
                <span className="font-semibold text-emerald-800">Enabled</span>
              </div>
              <div className="p-4 bg-surface-container-low rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Backup</span>
                <span className="font-semibold text-emerald-800">6h ago</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-80 h-48 rounded-xl overflow-hidden ghost-border relative">
            <img alt="Schema Visualization" className="w-full h-full object-cover grayscale opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm_eokzYY2KKyy9MznRvIf_JmRSxbeggpOlpwxPutAe9HceHuznpJUEV2tkmjAO_uNIddEhzN2X-w21KkvJJOEqLIcHw0pB24qQJdBUQYzSi4ikSVHFbkxolGPIFc93TGjnbI43FDUzO37nIcVfL_A6-lax_i_acGSHmvPYvl-rgU83aAII3zftLZW48gECo5bOZeNnMmaNWsW0mJzUT6KzCiyEWhcKX5sFoDC0LySq2pxuXCFfW7U461SZvKZrM-tzGJAOMQZe9XK" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default SchemaExplorerPage;
